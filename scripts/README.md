# Cloud Slicer Pricing CLI

A command-line tool to calculate accurate 3D printing prices using the Cloud Slicer API.

## Why Cloud Slicer?

Cloud Slicer provides **real slicing calculations** instead of volume-based estimates:

- ✅ **Actual slicing**: Generates real G-code to calculate exact print time
- ✅ **Accurate material usage**: Based on actual toolpath, not just volume estimates
- ✅ **Precise pricing**: Uses real print time and material consumption
- ✅ **Cloud-based**: No need to install slicing software locally

## Setup

### 1. Get API Key

1. Visit [Cloud Slicer API](https://api.cloudslicer3d.com)
2. Create an account and generate an API key
3. Add your API key to `.env.local`:

```bash
CLOUD_SLICER_API_KEY=your_api_key_here
```

### 2. Install Dependencies

Dependencies are already installed if you ran `npm install` in the project root.

## Usage

### Basic Usage

```bash
npm run calc-price -- path/to/model.stl
```

### With Options

```bash
npm run calc-price -- path/to/model.stl --quality high --material PETG --infill 50 --quantity 3
```

### Options

| Option | Values | Default | Description |
|--------|--------|---------|-------------|
| `--quality` | `draft`, `standard`, `high`, `ultra` | `standard` | Print quality (affects layer height and speed) |
| `--material` | `PLA`, `PETG`, `ABS`, `Resin` | `PLA` | Material type (affects temperature and cost per gram) |
| `--infill` | `5-100` | `25` | Infill density percentage |
| `--quantity` | `1+` | `1` | Number of prints |

## Examples

### Standard PLA print
```bash
npm run calc-price -- models/test.stl
```

### High-quality PETG print with 75% infill
```bash
npm run calc-price -- models/part.stl --quality high --material PETG --infill 75
```

### Batch of 10 draft prints
```bash
npm run calc-price -- models/figurine.stl --quality draft --quantity 10
```

## Output

The CLI provides a detailed breakdown:

```
🖨️  Cloud Slicer Pricing Calculator

📋 Configuration:
   File: test-cube.stl
   Quality: standard
   Material: PLA
   Infill: 25%
   Quantity: 1

📤 Uploading model to Cloud Slicer...
✅ File uploaded (ID: abc123)

🔄 Slicing model and calculating pricing...
✅ Quote generated

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💰 PRICING BREAKDOWN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⏱️  Print Time:     1h 23m
⚖️  Material Weight: 12.4g

🔧 Machine Cost:   ₦2,766
🧵 Material Cost:  ₦1,860
⚙️  Setup Fee:     ₦500

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💰 Total Cost:     ₦5,126
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✨ Quote ID: quote_xyz789
```

## How It Works

1. **Upload**: Sends your 3D model file to Cloud Slicer
2. **Slice**: Cloud Slicer generates G-code using your specified settings
3. **Calculate**: Analyzes the G-code to determine exact print time and material usage
4. **Price**: Applies your pricing rules to generate a quote

## Pricing Configuration

The CLI uses the same pricing constants as the web app:

- **Machine cost**: ₦2,000/hour
- **Material cost**:
  - PLA: ₦150/g
  - PETG: ₦180/g
  - ABS: ₦170/g
  - Resin: ₦350/g
- **Setup fee**: ₦500 per model

You can modify these in `lib/cloud-slicer-client.ts` → `getDefaultQuoteConfig()`.

## Printer Configuration

Default printer settings (based on Ender 3):
- Bed size: 220mm × 220mm × 250mm
- Nozzle diameter: 0.4mm
- Layer heights:
  - Draft: 0.3mm
  - Standard: 0.2mm
  - High: 0.1mm
  - Ultra: 0.05mm

Modify in `lib/cloud-slicer-client.ts` → `getDefaultPrinterConfig()`.

## Troubleshooting

### API Key Not Set
```
❌ Error: CLOUD_SLICER_API_KEY environment variable not set
```
**Solution**: Add your API key to `.env.local`

### File Not Found
```
❌ Error: File not found: /path/to/model.stl
```
**Solution**: Check the file path and ensure it exists

### Upload Failed
```
❌ Error: Failed to upload file: 401 Unauthorized
```
**Solution**: Verify your API key is correct

### Slicing Failed
```
❌ Error: Failed to generate quote: 400 Bad Request
```
**Solution**: Check that your STL file is valid and not corrupted

## Cloud Slicer vs Volume-Based Estimation

| Feature | Cloud Slicer | Volume-Based |
|---------|-------------|--------------|
| Print time accuracy | ✅ Exact (from G-code) | ⚠️ Estimated (weight ÷ speed) |
| Material usage | ✅ Actual toolpath | ⚠️ Volume × density × infill |
| Supports/rafts | ✅ Included in calculation | ❌ Not accounted for |
| Travel moves | ✅ Accounted for | ❌ Not accounted for |
| Setup required | 🔧 API key needed | ✅ Works offline |
| Speed | ⚠️ Requires upload | ✅ Instant |

## Next Steps

To integrate Cloud Slicer into the main web application:

1. Update `lib/pricing.ts` to use Cloud Slicer API
2. Store Cloud Slicer `file_id` when users upload models
3. Call Cloud Slicer quote API instead of local calculation
4. Add fallback to volume-based calculation if API is unavailable

See the main project README for integration instructions.
