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

### 2. Bible Reference Command

Quick command for inserting Bible references:

`/b` - Creates a wiki link to a Bible verse with two options:

1. Create JW Library link

```
/b mat 24:14
→ [Matthäus 24:14](jwlibrary:///finder?bible=40024014)
```

2. Create JW Library link and open

```
/b joh3:16
→ [Johannes 3:16](jwlibrary:///finder?bible=43003016) + opens it in JW Library
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
3. Select the desired option from the suggestions to either create a link or create and open the link

### Converting Existing Links

1. Open the command palette (Ctrl/Cmd + P)
2. Search for "Replace links"
3. Choose the desired replacement option
