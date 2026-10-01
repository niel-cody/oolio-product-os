# The device matrix

The surfaces Oolio software runs on, and what each one means for testing. **Status: the surface list is from the QA Skill Family proposal and the product context (self-ordering, kiosks, KDS); specific hardware models, screen sizes and OS versions are not recorded here yet and must come from Engineering and hardware.** Until they do, test at the viewport classes below and state the class used in every finding.

| Surface | Who uses it, where | Input | Viewport class to test | What the conditions demand |
|---|---|---|---|---|
| **POS terminal** | Front of house, behind the counter or bar, during service | Touch, sometimes with wet or gloved hands | The terminal's landscape resolution (from Engineering); fallback 1280 × 800 touch | Large targets, 7:1 on prices (proposed), no hover, glare, speed |
| **mPOS** (handheld) | Floor staff taking orders at the table | One-handed touch, walking | Phone portrait, 390 × 844 class | Reach, one hand, interruptions |
| **Kiosk** | Guests ordering themselves | Touch, standing, unfamiliar | Portrait kiosk class (from Engineering); fallback 1080 × 1920 | Self-evident use, no training, public accessibility |
| **KDS** | Kitchen, at the pass and the stations | Bump bar or touch, at distance | Landscape wall display class | Glanceable at distance, heat, noise, colour never the only signal |
| **CDS** | Customer-facing display beside the POS | None (display only) | The display's resolution | Readable at distance, price correctness |
| **Back office, laptop** | Owners, managers, head office | Mouse and keyboard | 1280 × 800 and 1440 × 900 | Dense data, keyboard efficiency, multi-tab use |
| **Back office, tablet** | Managers on the floor | Touch | 1024 × 768 class | Targets, no hover-only controls |
| **Online ordering, phone** | Guests | Touch | 390 × 844 and 360 × 800 | Reflow, 44 px targets (proposed), slow networks |
| **Online ordering, desktop** | Guests | Mouse and keyboard | 1440 × 900 | Standard web |

## Rules

- **Test the surface the persona uses.** A head chef card is tested at the KDS class, not at a laptop viewport.
- **Back office is not desktop-only.** Run at least one tablet pass on any back-office flow a manager does on the floor.
- **Name the class in every finding**, so a reader knows a layout break at 1024 is not a break at 1440.
- Device-level testing on real hardware (POS terminals, KDS screens, printers, payment devices) is human-required and listed as such in the verdict until a device lab exists.
