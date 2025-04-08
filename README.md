# JW Library Linker for Obsidian

This Obsidian plugin enhances your note-taking experience by providing seamless integration with JW Library links and Bible references.

## Features

### 1. Bulk Link Conversion

Automatically converts JW Library links to a format that works directly in JW Library:

- Converts Bible verse and publication links from `jwpub://` to `jwlibrary://` format
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

/b joh1:1,2,4
→ [Johannes 1:1-2](link),[4](link)

/b joh1:1,2,4,6,7-8,12-14
→ [Johannes 1:1-2](link),[4](link),[6-8](link),[12-14](link)
```

2. Create JW Library link and open

```
/b joh3:16
→ [Johannes 3:16](jwlibrary:///finder?bible=43003016) + opens it in JW Library
```

## Commands

The plugin adds the following commands to Obsidian:

- **Convert all links**: Converts all JW Library links in the current note
- **Convert Bible verse links**: Only converts Bible verse links
- **Convert publication links**: Only converts publication links
- **Convert Bible reference to Library link**: Converts selected text to a JW Library link (if it's a valid Bible reference)

## Usage

### Converting Bible References

1. Type `/b` followed by a space
2. Enter the Bible reference (e.g., "matthäus 24:14" or "joh 3:16" or "offb21:3")
3. Select the desired option from the suggestions to either create a link or create and open the link

### Converting Existing Links

1. Open the command palette (Ctrl/Cmd + P)
2. Search for "Convert link"
3. Choose the desired replacement option

## Contributing

If you have ideas or want to help improve this plugin take a look at our [contribution guidelines](https://github.com/msakowski/obsidian-library-linker/blob/main/CONTRIBUTING.md)

## Known Issues

- https://github.com/tadashi-aikawa/obsidian-various-complements-plugin
