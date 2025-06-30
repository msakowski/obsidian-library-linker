# JW Library Linker for Obsidian

This Obsidian plugin enhances your note-taking experience by providing seamless integration with JW Library links and Bible references.

## Features

### 1. Bible Reference Linking

**Quick Reference Creation**: `/b` command for inserting new Bible references

**Plain Text Conversion**: Automatically detects and converts Bible references in selected text to JW Library links

### 2. Bulk Link Conversion

Converts JW Library links and web links to formats that work directly in JW Library:

- Converts Bible verse and publication links from `jwpub://` to `jwlibrary://` format
- Converts jw.org web links to `jwlibrary://` format
- Option to maintain the original text of the link while updating the URL
- Command with suggester interface to choose conversion type (all links, Bible verses only, publications only, or web links only)

## Usage

### Creating Bible References to JW Library

1. Type `/b` followed by a space
2. Enter the Bible reference (e.g., "matthäus 24:14" or "joh 3:16" or "offb21:3")
3. Select the desired option from the suggestions to either create a link or create and open the link

**Examples:**

```
/b mat 24:14
→ [Matthäus 24:14](jwlibrary:///finder?bible=40024014)

/b joh1:1,2,4
→ [Johannes 1:1-2](link),[4](link)

/b joh1:1,2,4,6,7-8,12-14
→ [Johannes 1:1-2](link),[4](link),[6-8](link),[12-14](link)
```

### Converting Existing Links

**Command: Convert to JW Library links**

Opens a suggester to choose which type of links to convert (all links, Bible verse links only, publication links only, or web links only) in the selected text

1. Select the text containing the links you want to convert
2. Open the command palette (Ctrl/Cmd + P)
3. Search for "Convert to JW Library links"
4. Choose the type of conversion you want:
   - **All**: Converts all JW Library links (Bible verses, publications, and web links)
   - **Bible**: Only converts Bible verse links
   - **Publication**: Only converts publication links
   - **Web**: Only converts jw.org web links

### Converting Plain Text Bible References

**Command: "Link unlinked Bible references"**

Converts plain text Bible references in selected text to JW Library links

1. Select text containing Bible references (e.g., "John 3:16" or "Romans 8:28")
2. Open the command palette (Ctrl/Cmd + P)
3. Search for "Link unlinked Bible references"
4. The plugin will automatically detect and convert valid Bible references to JW Library links

## Contributing

If you have ideas or want to help improve this plugin take a look at our [contribution guidelines](https://github.com/msakowski/obsidian-library-linker/blob/main/CONTRIBUTING.md)

## Known Issues

| Plugin                                                                                            | Issue                             | Fix                                   |
| ------------------------------------------------------------------------------------------------- | --------------------------------- | ------------------------------------- |
| [Iconize](obsidian://show-plugin?id=obsidian-icon-folder)                                         | Clock emoji shows when typing `:` | Edit Iconize trigger from `:` to `::` |
| [Various Complements](https://tadashi-aikawa.github.io/docs-obsidian-various-complements-plugin/) | Suggestions get overwritten       | 🤷‍♂️                                    |
