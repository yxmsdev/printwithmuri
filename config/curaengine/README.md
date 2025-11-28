# CuraEngine Configuration

This directory contains configuration profiles for CuraEngine slicing.

## Current Implementation

The CuraEngine wrapper (`lib/curaengine.ts`) currently uses inline settings for simplicity. Settings are configured programmatically based on quality level and material type.

## Settings by Quality Level

### Draft
- Layer Height: 0.3mm
- Print Speed: 80mm/s
- Use Case: Fast prototypes, non-critical parts

### Standard
- Layer Height: 0.2mm
- Print Speed: 60mm/s
- Use Case: General purpose printing

### High
- Layer Height: 0.1mm
- Print Speed: 40mm/s
- Use Case: Detailed parts, good finish

### Ultra
- Layer Height: 0.05mm
- Print Speed: 20mm/s
- Use Case: Maximum detail, show pieces

## Material Settings

### PLA
- Nozzle Temp: 210°C
- Bed Temp: 60°C

### PETG
- Nozzle Temp: 235°C
- Bed Temp: 80°C

### ABS
- Nozzle Temp: 240°C
- Bed Temp: 100°C

### Resin
- Not applicable for FDM printing

## Printer Specifications

- Bed Size: 220mm × 220mm × 250mm (Ender 3 compatible)
- Nozzle Diameter: 0.4mm
- Filament Diameter: 1.75mm

## Future Enhancement

For production deployment, you may want to use full Cura JSON definition files instead of inline settings. This would allow:
- More granular control over all slicing parameters
- Easy profile switching and management
- Support for multiple printer types
- Import of community profiles

To use JSON profiles, you would modify `lib/curaengine.ts` to load `.def.json` files from this directory instead of using inline settings.
