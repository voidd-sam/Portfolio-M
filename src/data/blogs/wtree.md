---
title: "Building wtree - A directory tree viewer in Rust"
description: "Built a small, dependency-free tree command in Rust that reads .gitignore, how you can build one yourself, and the mistakes I made while shipping it."
date: "2026-11-19"
readTime: "14 min read"
tags: ["Rust", "CLI", "Open Source", "Git"]
---

I wanted a `tree` command that did not show me `target/` and `node_modules/` every time I ran it. The usual fix is to remember flags or write an ignore list in a shell alias. I decided to write my own tool instead, in Rust, with no external crates.

The result is wtree. It prints a directory as a tree, colors names by file type, and reads the project's `.gitignore` so it hides what git already considers noise. This is how it works, how you can build the same thing, and what went wrong while I shipped it.

The source is at https://github.com/voidd-sam/wtree.

## What it looks like

```text
$ wtree
.
├── assets
│   └── banner.png
├── src
│   ├── cli.rs
│   ├── gitignore.rs
│   ├── ignore.rs
│   ├── main.rs
│   ├── style.rs
│   └── walker.rs
├── Cargo.lock
├── Cargo.toml
└── README.md

2 directories, 10 files, 1 ignored (-i to show)
```

The `target/` folder is there on disk. It is hidden because the project's `.gitignore` lists it, and the footer tells you one entry was hidden. `wtree -i` shows it again.

## Why no dependencies

Rust makes it easy to add crates. For a tree viewer you would normally reach for `clap` for arguments, `walkdir` or `ignore` for walking directories, and a color crate. I skipped all of them on purpose.

The reasons were practical:

- The build is fast, because there is nothing to download or compile besides my own code.
- The binary stays small. A stripped release build of an early version was about 332 KB.
- I had to learn how each part works instead of calling a library.

The costs are real too. I had to write an argument parser and a `.gitignore` matcher myself, and both are easy to get slightly wrong. If you are building a tool you need to ship quickly, use the crates. If you want to learn, write the parts yourself once.

## How to build it

### Step 1: Create the project

```bash
cargo new wtree
cd wtree
```

Cargo creates `Cargo.toml` and `src/main.rs`. Open `Cargo.toml` and add a release profile at the bottom:

```toml
[profile.release]
opt-level = 3
lto = true
codegen-units = 1
strip = true
panic = "abort"
```

What these do, in short: `opt-level = 3` turns on full optimization. `lto` and `codegen-units = 1` let the compiler optimize across the whole program at the cost of a slower build. `strip` removes debug symbols from the binary. `panic = "abort"` ends the program on a panic instead of unwinding, which makes the binary smaller and is fine for a command line tool.

Also fill in the package metadata while you are here:

```toml
[package]
name = "wtree"
version = "0.1.0"
edition = "2021"
description = "A directory tree viewer"
license = "MIT"
repository = "https://github.com/your-name/wtree"
```

You will see why the version matters in the section about mistakes.

### Step 2: Walk a directory

The core of the tool is a function that lists a folder, prints each entry, and calls itself for every subfolder.

```rust
use std::fs;
use std::io::{self, Write};
use std::path::Path;

fn walk(dir: &Path, prefix: &str, out: &mut impl Write) -> io::Result<()> {
    let entries = match fs::read_dir(dir) {
        Ok(e) => e,
        Err(_) => return Ok(()), // unreadable folder: skip it
    };

    let mut items: Vec<(String, bool)> = Vec::new();
    for entry in entries.flatten() {
        let name = entry.file_name().to_string_lossy().into_owned();
        let is_dir = entry.file_type().map(|t| t.is_dir()).unwrap_or(false);
        items.push((name, is_dir));
    }

    // folders first, then files, each group sorted ignoring case
    items.sort_by_cached_key(|(name, is_dir)| (!is_dir, name.to_lowercase()));

    let total = items.len();
    for (i, (name, is_dir)) in items.iter().enumerate() {
        let last = i + 1 == total;
        let connector = if last { "└── " } else { "├── " };
        writeln!(out, "{}{}{}", prefix, connector, name)?;

        if *is_dir {
            let cont = if last { "    " } else { "│   " };
            let new_prefix = format!("{}{}", prefix, cont);
            walk(&dir.join(name), &new_prefix, out)?;
        }
    }
    Ok(())
}

fn main() -> io::Result<()> {
    let stdout = io::stdout();
    let mut out = stdout.lock();
    writeln!(out, ".")?;
    walk(Path::new("."), "", &mut out)
}
```

Run it with `cargo run`. You already have a working tree command.

Three details in this code are worth knowing.

**The prefix.** The vertical lines on the left are not drawn per line. Each level passes a string down to the next level: `│   ` if the parent still has siblings below it, or four spaces if the parent was the last one. That is the whole trick.

**`entry.file_type()`.** On Linux this uses information the kernel already returns while listing the directory, so it costs no extra system call. If you call `fs::metadata` on every entry instead, you pay for one `stat` per file, which adds up on big trees.

**Symlinks.** `entry.file_type()` does not follow symbolic links. A link to a folder reports as a link, not a folder, so the walker never enters it. This avoids infinite loops when a link points back to a parent.

I lock stdout once with `stdout.lock()` and write through that handle. Output is printed as the walk happens, so a large tree starts appearing right away and the whole tree is never held in memory.

### Step 3: Limit the depth

Pass a level number down and stop when it passes the maximum:

```rust
fn walk(dir: &Path, prefix: &str, level: usize, max: Option<usize>, out: &mut impl Write)
    -> io::Result<()>
{
    if let Some(m) = max {
        if level > m {
            return Ok(());
        }
    }
    // ... same as before, and call walk(..., level + 1, max, out)
    Ok(())
}
```

Children of the root are level 1, so `--depth 1` lists only the top folder's contents.

### Step 4: Add color

Terminal colors are plain text escape codes. You print `\x1b[1;34m`, then the text, then `\x1b[0m` to reset.

```rust
fn paint(code: &str, s: &str) -> String {
    format!("\x1b[{}m{}\x1b[0m", code, s)
}

// bold blue for directories, gray for the tree lines
let dir_name = paint("1;34", name);
let line = paint("90", &format!("{}{}", prefix, connector));
```

You should not print color when the output goes into a pipe or a file, because the escape codes would end up in the data. Rust has `std::io::IsTerminal` for this check. There are also two conventions worth following: `NO_COLOR` turns color off, and `CLICOLOR_FORCE` turns it on even through a pipe.

```rust
use std::io::IsTerminal;

fn should_color() -> bool {
    let no_color = std::env::var_os("NO_COLOR").map(|v| !v.is_empty()).unwrap_or(false);
    let force = std::env::var_os("CLICOLOR_FORCE").map(|v| !v.is_empty()).unwrap_or(false);
    force || (std::io::stdout().is_terminal() && !no_color)
}
```

For color by file type, match on the extension. Group files into a few classes (source code, config, docs, images, archives) and give each class one color. A short `match` is enough.

### Step 5: Parse arguments yourself

Without `clap`, arguments are a loop over `std::env::args()`:

```rust
let mut i = 1;
while i < argv.len() {
    match argv[i].as_str() {
        "-a" | "--all" => show_hidden = true,
        "-d" | "--depth" => {
            i += 1;
            let value = argv.get(i).ok_or("missing value for --depth")?;
            max_depth = Some(value.parse().map_err(|_| "depth must be a number")?);
        }
        s if s.starts_with('-') => return Err(format!("unknown flag '{}'", s)),
        path => target = Some(path.to_string()),
    }
    i += 1;
}
```

The first version only needed this much. Later I added things people expect from a command line tool: combined short flags (`-ai`), attached values (`-d2`, `--depth=2`), and `--` to end option parsing so you can list a folder whose name starts with a dash. Add those only when you need them.

Return a non-zero exit code for bad input. I use 2 for invalid arguments and 1 for runtime errors such as a missing path.

### Step 6: Handle a closed pipe

Try `wtree | head`. The `head` command exits after ten lines, closes the pipe, and your next write fails with a "broken pipe" error. If you do not handle that, your tool prints an error message for something that is not an error.

```rust
match run() {
    Ok(_) => ExitCode::SUCCESS,
    Err(e) if e.kind() == io::ErrorKind::BrokenPipe => ExitCode::SUCCESS,
    Err(e) => {
        eprintln!("wtree: {}", e);
        ExitCode::from(1)
    }
}
```

### Step 7: Read .gitignore

This is the feature that made wtree worth using. The first version of the tool hid a fixed list of folders: `node_modules`, `target`, `.git`, `dist` and a few more. That list is a guess. Every project has different junk, and a project with a folder called `output/` full of generated files would flood the screen. The project's own `.gitignore` already says what is junk, so the tool should read it.

The model I used has five parts.

**1. Parse each line into a rule.** Skip blank lines and lines starting with `#`. A leading `!` makes a rule negative. A trailing `/` means directories only. A slash anywhere else in the pattern anchors it to the folder where the `.gitignore` lives.

**2. Treat a plain name as "at any depth".** A pattern with no slash, like `*.log`, matches at any level. The simplest way to handle this is to rewrite `name` as `**/name` and give `**` the meaning "zero or more folders".

**3. Match one path segment at a time.** Split the pattern and the path on `/`. Then you only need a small wildcard matcher for a single name, supporting `*` and `?`:

```rust
fn glob(pat: &[u8], text: &[u8]) -> bool {
    match (pat.first(), text.first()) {
        (None, None) => true,
        (Some(b'*'), _) => glob(&pat[1..], text) || (!text.is_empty() && glob(pat, &text[1..])),
        (Some(b'?'), Some(_)) => glob(&pat[1..], &text[1..]),
        (Some(p), Some(t)) if p == t => glob(&pat[1..], &text[1..]),
        _ => false,
    }
}
```

This recursive version is fine for learning. A pattern with many stars can make it slow on long names, so the version in the repository is a loop that remembers the last star position and backs up to it.

**4. Keep a stack of rule sets.** When the walker enters a folder, it checks for a `.gitignore` there and pushes its rules. When it leaves, it pops them.

```rust
let pushed = stack.push_dir(dir);   // reads dir/.gitignore if it exists
// ... list the entries, skip ignored ones, recurse into folders ...
if pushed { stack.pop(); }
```

To decide whether a path is ignored, look at the rule sets from the deepest to the shallowest. Inside one set, look at the rules from the last line to the first. The first rule that matches decides: a normal rule means ignored, a `!` rule means not ignored. This gives you git's behavior that later lines win and deeper files win.

**5. Do not enter ignored folders.** This is both correct and fast. wtree never reads the inside of a huge `node_modules` by default.

Two details that are easy to miss:

- If someone runs `wtree src/` inside a repository, the `.gitignore` in the repository root still applies to `src/`. So at startup, walk up from the start folder to find the folder that contains `.git`, and load every `.gitignore` between that folder and the start folder.
- Keep the old hardcoded list, but only as a fallback when no `.gitignore` applies at all.

Add unit tests for the matcher. It is the part of this tool most likely to have bugs, and the rules are easy to test one line at a time: `target/` matches a folder but not a file, `/build` matches only at the top, `!keep.log` brings a file back.

wtree also supports `**`, character classes like `[a-z]`, and backslash escapes. It does not read the global git ignore file, and it does not check whether git tracks a file. A tracked file that matches an ignore rule is hidden by wtree even though git still tracks it. I documented that in the README, because it is the kind of difference that confuses people.

### Step 8: Keep what is hidden visible

A tool that silently hides things is hard to trust. wtree counts the entries it skipped because of ignore rules and prints the number in the footer: `1 ignored (-i to show)`. The `-i` flag shows them again, dimmed. It costs a counter and a line of output, and it removes most of the "where did my folder go" questions.

## Shipping it

Writing the code was the easier half. These are the steps for getting a binary to other people.

### Build and install

```bash
cargo build --release
cp target/release/wtree ~/.local/bin/wtree
```

`~/.local/bin` must be in your `PATH`. After that, `wtree` works from any folder.

### Tag the version

A git tag marks the exact commit a version was built from:

```bash
git tag -a v0.1.3 -m "wtree v0.1.3"
git push origin v0.1.3
```

### Package the binary

```bash
mkdir -p /tmp/wtree-v0.1.3
cp target/release/wtree README.md /tmp/wtree-v0.1.3/
tar -czf wtree-v0.1.3-x86_64-linux.tar.gz -C /tmp wtree-v0.1.3
sha256sum wtree-v0.1.3-x86_64-linux.tar.gz > wtree-v0.1.3-x86_64-linux.tar.gz.sha256
```

I build the folder in `/tmp` so the archive contains one clean folder and my project stays free of leftovers. The `.sha256` file holds a fingerprint of the archive. A user can run `sha256sum -c` on it to confirm the download is intact.

### Publish a release

On GitHub, open Releases, create a new release from the tag, and attach the `.tar.gz` and the `.sha256` file. Then do what most people skip: download the release the way a user would, check the checksum, and run it.

```bash
curl -LO https://github.com/voidd-sam/wtree/releases/download/v0.1.3/wtree-v0.1.3-x86_64-linux.tar.gz
curl -LO https://github.com/voidd-sam/wtree/releases/download/v0.1.3/wtree-v0.1.3-x86_64-linux.tar.gz.sha256
sha256sum -c wtree-v0.1.3-x86_64-linux.tar.gz.sha256
tar -xzf wtree-v0.1.3-x86_64-linux.tar.gz
./wtree-v0.1.3/wtree --version
```

If it prints `OK` and the right version, the release works.

### One more thing about portability

A normal Rust build on Linux links to the system's glibc. A binary built on a new system can fail on an older distribution with a "GLIBC not found" error. If you want one binary that runs anywhere on x86-64 Linux, build for the musl target:

```bash
rustup target add x86_64-unknown-linux-musl
cargo build --release --target x86_64-unknown-linux-musl
```

## Mistakes I made and what I learned

These are the problems that actually cost me time. Most of them are small, and none of them are about Rust.

**The new binary printed the old version.** I replaced the file in `~/.local/bin` with my v0.1.2 build and it still said `tree-rs 0.1.0`. The file was fine. I had never changed the text in the source: the name and version were hardcoded strings in `main.rs`, and `Cargo.toml` still said 0.1.0. The fix is to read them from Cargo at build time:

```rust
const NAME: &str = env!("CARGO_PKG_NAME");
const VERSION: &str = env!("CARGO_PKG_VERSION");
```

Now the version lives in one place. Search your code for every hardcoded copy of the name too. My error messages still said `tree:` and suggested running `tree --help`, which is a command that does not exist.

**Keep three version numbers equal.** The version in `Cargo.toml`, the git tag, and the archive name should all be the same. If they drift, nobody can tell which build they have.

**I checked the install the wrong way.** I ran `pacman -Qe | grep wtree` and got nothing. Pacman only knows about packages it installed. A file you copy by hand is invisible to it. To inspect a hand-installed binary, use `which wtree`, `ls -l`, `stat`, `file` and `ldd`. To make pacman know about it, you have to write a `PKGBUILD`.

**`.gitignore` does not affect files git already tracks.** I had committed the release folder and the `.tar.gz` by accident. Adding them to `.gitignore` did nothing. The fix is to remove them from git without deleting them from disk, then ignore them:

```bash
git rm --cached wtree-v0.1.2-x86_64-linux.tar.gz
git rm -r --cached wtree-v0.1.2
```

Release archives belong on the GitHub Releases page, not in the repository.

**Ignore patterns match the whole name.** I wrote `/wtree-v` to ignore folders like `wtree-v0.1.2`. That matches only a name that is exactly `wtree-v`. It needed `/wtree-v*/`. Another one: `*.tar.gz` does not match `file.tar.gz.sha256`, so the checksum file kept showing up as untracked until I added `*.sha256`. The `[?]` in my shell prompt was telling me about it the whole time.

**Do not ignore `Cargo.lock` for a program.** A lot of templates put it in `.gitignore`. The Cargo guidance is to commit it for binaries and skip it for libraries. People who run `cargo install --git` get your exact dependency versions that way, and package builds that use `--locked` fail without it.

**The README said something the code did not do.** The README claimed `--all` shows `node_modules` and `target`. The walker skipped those folders no matter what flags you passed. Reading the code again while adding `.gitignore` support is how I found it. When you write documentation, run the examples against the real binary.

**`/target` and `./target` are different paths.** A path that starts with `/` begins at the root of the disk. `./` begins in the current folder. I typed `/target/release/wtree` from inside the project and got "no such file". This also explains why you have to write `./wtree` to run a binary in the current folder: the current folder is not in `PATH`.

**`cargo build` overwrites the previous binary.** `target/release/wtree` is always the newest build and nothing else. Cargo does not keep old versions. If you want old versions, keep them as git tags and release archives, and rebuild from a tag with `git checkout v0.1.2`. The whole `target/` folder can be deleted with `cargo clean` and rebuilt.

**A flag letter can clash with muscle memory.** In wtree, `-d` sets the depth. In the real `tree` command, `-d` lists directories only, and `-L` sets the depth. People who know `tree` will type the wrong one. I added `-L` as an alias, but if I were starting over I would use the same letters as `tree` from day one.

**A start-up problem I did not expect: the path.** The ignore rules are relative to the folder that holds each `.gitignore`. That means the walker needs absolute paths to compute the relative path of each entry. I call `fs::canonicalize` on the start folder once and walk that path, while printing the name the user typed.

## What is missing

wtree does not show file sizes, dates or permissions. It has no pattern filters like `-P` and `-I`, no directories-only mode, no JSON output, and no git status markers. It is developed on Linux and I have not tested it on Windows. The README lists these limits so nobody has to find them by surprise.

The next things I plan to add are `-D` for directories only, pattern filters that reuse the glob matcher from the `.gitignore` code, and git status markers next to changed files.

## If you want to build your own

A short list of what I would tell someone starting today:

1. Get the plain version working first: walk, sort, draw the lines. It is about 40 lines.
2. Add depth, then color, then arguments. Ship something small before you add the clever feature.
3. Pick the clever feature by asking what you would use on every run. For me that was `.gitignore`.
4. Make the version come from `Cargo.toml` from the first commit.
5. Write the `.gitignore` for your own repository before your first commit, and keep release archives out of it.
6. Test the published release by downloading it, not by running your local build.
7. Write the README last, and run every example in it.

The whole tool is a handful of small files. The code is on GitHub at https://github.com/voidd-sam/wtree. If you find a bug in the `.gitignore` matching, open an issue with the pattern and the path that failed.
