# Android Debugging Guide for JW Library Linker Plugin

This guide explains how to debug the JW Library Linker plugin on Android devices.

## Overview

The plugin includes comprehensive debug logging for the Bible quote functionality. When enabled, detailed logs are output to the console, which can be viewed using Chrome Remote Debugging.

## Setting Up Android Debugging

### Prerequisites

- Android device with Developer Settings enabled
- USB cable
- Computer with Chrome browser installed
- ADB (Android Debug Bridge) - usually comes with Android SDK

### Step-by-Step Setup

1. **Enable Developer Settings on Android**
   - Open Settings on your Android device
   - Navigate to "About phone" or "About device"
   - Tap "Build number" 7 times to unlock Developer Options
   - A message will confirm that Developer mode is enabled

2. **Enable USB Debugging**
   - Go to Settings → System → Developer options
   - Enable "USB debugging"
   - Confirm the prompt if it appears

3. **Connect Device to Computer**
   - Connect your Android device to your computer using a USB cable
   - On your device, approve the USB debugging authorization prompt
   - Select "Always allow from this computer" (optional but recommended)

4. **Access Chrome Remote Debugging**
   - Open Chrome browser on your computer
   - Navigate to: `chrome://inspect`
   - Your Android device should appear in the list
   - If it doesn't appear, ensure USB debugging is enabled and the cable is properly connected

5. **Debug Obsidian**
   - Open Obsidian on your Android device
   - In Chrome's `chrome://inspect` page, you should see Obsidian listed under your device
   - Click "inspect" next to Obsidian
   - A DevTools window will open with access to the console

## Using Debug Logs

### Viewing Logs

Once connected to Chrome DevTools:

1. Open the **Console** tab
2. Use the plugin's Bible quote functionality
3. Look for log entries prefixed with `[BibleQuotes]`

### Log Format

All debug logs follow this format:
```
[TIMESTAMP] [Platform] [BibleQuotes] MESSAGE {data}
```

Example:
```
[2025-12-14T10:30:45.123Z] [Mobile] [BibleQuotes] insertAllBibleQuotes started {useWOL: false, linkCount: 1}
```

### What's Logged

The debugging system logs:

- **Function Entry/Exit**: When major functions start and complete
- **Performance Timing**: Duration of operations in milliseconds
- **Data Flow**: Input parameters and output results
- **Link Processing**: Details about each JW Library link found and processed
- **Error Information**: Full error messages and stack traces
- **Line Numbers**: Current line being processed in the editor
- **State Checks**: Whether quotes already exist, link validation, etc.

### Key Functions with Debug Logging

1. **`generateBibleQuoteText`**
   - Logs Bible text fetching
   - Shows markdown link conversion
   - Tracks formatting operations
   - Reports performance timing

2. **`insertAllBibleQuotes`**
   - Logs all links found in the document
   - Shows processing order (reverse)
   - Reports skipped links and reasons
   - Tracks changes applied

3. **`insertBibleQuoteAtCursor`**
   - Logs cursor position
   - Shows link detection at cursor
   - Reports quote insertion or skip reasons

### Filtering Logs

In Chrome DevTools Console, you can filter logs:

- Type `BibleQuotes` in the filter box to see only plugin logs
- Use `-BibleQuotes` to exclude plugin logs
- Click the log level buttons (Info, Warnings, Errors) to filter by severity

## Enabling/Disabling Debug Logs

Debug logging is controlled by the `DEBUG_QUOTING` constant in `src/utils/insertBibleQuotes.ts`:

```typescript
// Set to true to enable debug logging
const DEBUG_QUOTING = true;

// Set to false to disable debug logging (for production)
const DEBUG_QUOTING = false;
```

When deploying to production, set this to `false` to reduce console output and improve performance.

## Common Debugging Scenarios

### Issue: Quotes Not Inserting

Check the logs for:
- Whether links are being found: Look for "Found JW Library links"
- If quotes already exist: Look for "quote already exists"
- Fetch failures: Look for "Fetch failed or no text returned"
- Link conversion failures: Look for "Failed to convert to markdown link"

### Issue: Wrong Quote Format

Check the logs for:
- "format" value in `generateBibleQuoteText started`
- Whether the correct format case is being executed

### Issue: Performance Problems

Check the logs for:
- Duration values in completion messages
- Number of links being processed
- Time spent in Bible text fetching

## Alternative Debugging Methods

### 1. Obsidian Dev Tools Plugin

The [Obsidian Dev Tools](https://github.com/KjellConnelly/obsidian-dev-tools) plugin provides an in-app console viewer. However, it may not be actively maintained.

### 2. Logcat (Advanced)

For more detailed Android system logs, you can use ADB logcat:

```bash
adb logcat | grep -i obsidian
```

This shows system-level logs but may be noisier than Chrome DevTools.

## Troubleshooting Connection Issues

### Device Not Appearing in chrome://inspect

1. Ensure USB debugging is enabled
2. Try a different USB cable (some cables are charge-only)
3. Try a different USB port
4. Restart ADB: `adb kill-server && adb start-server`
5. Check USB connection mode (should be "File Transfer" or "MTP" mode)

### Obsidian Not Appearing in chrome://inspect

1. Ensure Obsidian is running on the device
2. Try closing and reopening Obsidian
3. Check that Obsidian has the necessary permissions
4. Try revoking and re-granting USB debugging authorization

## Additional Resources

- [Obsidian Mobile Development Docs](https://docs.obsidian.md/Plugins/Getting+started/Mobile+development)
- [Chrome DevTools Documentation](https://developer.chrome.com/docs/devtools/)
- [Android Debug Bridge (ADB) Documentation](https://developer.android.com/tools/adb)
- [Obsidian Forum: Debugging Mobile Plugins](https://forum.obsidian.md/t/debugging-obsidian-mobile-plugins/20913)

## Contributing

If you discover better debugging methods or encounter issues not covered here, please contribute to this documentation or open an issue on the project repository.
