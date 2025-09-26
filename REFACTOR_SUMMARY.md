# Excalidraw to Kroolo Refactoring Summary

This document summarizes the changes made to refactor the codebase from using `.excalidraw` file extensions to `.kroolo` while maintaining backward compatibility.

## Key Changes Made

### 1. Constants and MIME Types (`packages/common/src/constants.ts`)
- Updated `STRING_MIME_TYPES.excalidraw` to use `"application/vnd.kroolo+json"`
- Updated `STRING_MIME_TYPES.excalidrawlib` to use `"application/vnd.kroololib+json"`
- Updated `EXPORT_DATA_TYPES.excalidraw` to `"kroolo"`
- Updated `EXPORT_DATA_TYPES.excalidrawLibrary` to `"kroololib"`
- Added new MIME type entries:
  - `kroolo: "application/vnd.kroolo+json"`
  - `kroololib: "application/vnd.kroololib+json"`
  - `excalidraw: "application/vnd.excalidraw+json"` (backward compatibility)
  - `excalidrawlib: "application/vnd.excalidrawlib+json"` (backward compatibility)
- Updated image MIME types from `excalidraw.svg/png` to `kroolo.svg/png`

### 2. File Extensions and Saving (`packages/excalidraw/data/`)

#### `json.ts`:
- Changed default save extension from `"excalidraw"` to `"kroolo"`
- Changed library save extension from `"excalidrawlib"` to `"kroololib"`
- Updated file descriptions to use "Kroolo" instead of "Excalidraw"

#### `blob.ts`:
- Added support for `.kroolo` and `.kroololib` file extensions
- Maintained backward compatibility with `.excalidraw` and `.excalidrawlib`
- Updated file type detection regex patterns
- Updated file handle type detection to include `kroolo` extension

#### `index.ts`:
- Changed embedded scene export extensions:
  - `"excalidraw.png"` → `"kroolo.png"`
  - `"excalidraw.svg"` → `"kroolo.svg"`

### 3. Scene Export (`packages/excalidraw/scene/export.ts`)
- Updated SVG metadata payload type to use `MIME_TYPES.kroolo`
- Added backward compatibility for reading both kroolo and excalidraw payload types in `decodeSvgBase64Payload()`

### 4. Image Handling (`packages/excalidraw/data/image.ts`)
- Updated PNG metadata encoding to use `MIME_TYPES.kroolo`
- Added backward compatibility for reading both kroolo and excalidraw metadata from PNG files

### 5. Application Components
- Updated library import descriptions in `LibraryMenuHeaderContent.tsx`
- Fixed drag-and-drop handling in `App.tsx` to support both new and legacy library formats

### 6. Manifest and Configuration (`excalidraw-app/vite.config.mts`)
- Added `.kroolo` file handler support
- Maintained `.excalidraw` file handler for backward compatibility
- Updated share target accept types to include both formats

## Backward Compatibility Features

1. **File Import**: The application can still open both `.excalidraw` and `.kroolo` files
2. **Library Import**: Both `.excalidrawlib` and `.kroololib` files are supported
3. **Image Metadata**: PNG/SVG files with embedded excalidraw data are still readable
4. **Drag & Drop**: Both old and new library formats work in drag-and-drop operations

## Default Behavior Changes

1. **New Files**: Now saved with `.kroolo` extension by default
2. **Library Files**: Now saved with `.kroololib` extension by default
3. **Embedded Exports**: PNG/SVG exports with embedded scenes use `.kroolo.png/.kroolo.svg`
4. **Metadata**: New embedded metadata uses kroolo MIME types

## Testing

The build completed successfully with no errors, confirming that:
- All TypeScript types are correctly updated
- No breaking changes were introduced
- Backward compatibility is maintained
- New kroolo extensions work as expected

## Impact

- **Users**: Can continue using existing `.excalidraw` files seamlessly
- **Exports**: New files will use `.kroolo` extension by default
- **Integrations**: Any external tools expecting `.excalidraw` files will need to be updated to also handle `.kroolo` files, but existing integrations will continue to work
- **File Associations**: Operating system file associations may need to be updated for the new extension

All changes maintain full backward compatibility while transitioning the default behavior to use the new `.kroolo` branding.