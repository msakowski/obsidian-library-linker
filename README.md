# JW Library Linker for Obsidian

This Obsidian plugin enhances your note-taking experience by providing seamless integration with JW Library links and Bible references.

## Features

### 1. Bulk Link Conversion
Automatically converts JW Library links to a format that works directly in JW Library:
- Converts Bible verse links from `jwpub://` to `jwlibrary://` format
- Converts publication links to the proper JW Library format
- Maintains the original text of the link while updating the URL

Commands to replace multiple links at once:
- Replace all JW Library links
- Replace only Bible verse links
- Replace only publication links

### 2. Bible Reference Commands
Quick commands for inserting Bible references:

- `/b` - Creates a wiki link to a Bible verse
  ```
  /b matthäus 24:14
  → [Matthäus 24:14](jwlibrary:///finder?bible=40024014)
  ```

- `/bo` - Creates a wiki link AND automatically opens it in JW Library
  ```
  /bo johannes 3:16
  → [Johannes 3:16](jwlibrary:///finder?bible=43003016)
  ```

## Commands

The plugin adds the following commands to Obsidian:

- **Replace all links**: Converts all JW Library links in the current note
- **Replace Bible verse links**: Only converts Bible verse links
- **Replace publication links**: Only converts publication links
- **Convert Bible reference to Library link**: Converts selected text to a JW Library link (if it's a valid Bible reference)

## Usage

### Converting Bible References
1. Type `/b` followed by a space
2. Enter the Bible reference (e.g., "matthäus 24:14" or "joh 3:16" or "offb21:3")
3. Select the suggestion to convert it to a link

### Converting Existing Links
1. Open the command palette (Ctrl/Cmd + P)
2. Search for "Replace links"
3. Choose the desired replacement option