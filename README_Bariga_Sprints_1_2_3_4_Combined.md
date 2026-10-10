# Web-Based Land Value Intelligence Tool --- Bariga LCDA, Lagos

## GeoRAD Emerging Spatial Professionals Mentorship Program

This project explores current land-market asking-price signals and
observed physical-development change across five selected wards
associated with Bariga LCDA, Lagos. It was completed through four GeoRAD
technical sprints: spatial preparation, market-data collection, market
intelligence, and satellite-based development-change analysis.

> **Important:** The land-market figures are indicative asking-price
> signals, not confirmed transaction prices or formal valuations. The
> satellite results are measurements from a standardized NDBI-based
> proxy; they are not a direct count of buildings or a prediction of
> future development.

------------------------------------------------------------------------

# 1. Project Objective

The broader project is a **Web-Based Land Value Intelligence Tool**
intended to help users explore:

-   Current land-market conditions
-   Observed development change over time
-   Spatial differences between selected locations
-   How market information and physical-development evidence can be
    considered together

The market and satellite signals are analysed independently first. Their
relationship should not be assumed or described as causal without
further evidence.

# 2. Study Area and Spatial Preparation --- Sprint 1

The assigned LCDA was **Bariga**. The initial spatial exploration used
GRID3 administrative and ward data. Because the available administrative
structure represented the area through LGA and ward boundaries, I
filtered specifically to `lganame = Shomolu` and `statename = Lagos`,
then identified eight wards associated with Bariga.

I dissolved the selected eight wards to create a working Bariga LCDA
boundary. For the technical sprint, my mentor requested polygon features
rather than point locations, so I selected five ward polygons and kept
them as separate features:

1.  Ibuowo / Owotutu
2.  Ilaje
3.  Pedro / Gbagada
4.  Aiyetoro / Mafowoku
5.  Owode / Orile Bariga

The GeoJSON field used for the ward names is `wardname`.

### Tools used

-   QGIS and GRID3 spatial data
-   Google Maps as a basemap
-   GeoJSON
-   Python and Google Colab

OpenStreetMap tiles were not accessible in my environment, so I used
Google Maps as the QGIS basemap. One lesson from this sprint was that
**place names alone are not enough when working with spatial data**. I
checked state, LGA and ward attributes to avoid selecting similarly
named places outside the study area.

📷 **IMAGE INDICATION --- Insert `study_areas_map.png` here**

*Suggested caption: Figure 1. Five selected ward polygons used as the
study areas in Bariga.*

# 3. Spatial Questions to Market Data --- Sprint 2

Sprint 2 connected each selected ward with current residential-land
asking-price information. The search question was adapted to:

> "Current asking price of residential land per sqm in \[Town\], Shomolu
> Lagos Nigeria"

The structured dataset contains a selected price observation, supporting
source and search date for each ward.

  Study area               Sprint 2 asking-price signal
  ---------------------- ------------------------------
  Ibuowo / Owotutu                         ₦415,000/sqm
  Ilaje                                    ₦320,000/sqm
  Pedro / Gbagada                        ₦1,200,000/sqm
  Aiyetoro / Mafowoku                      ₦420,000/sqm
  Owode / Orile Bariga                     ₦250,000/sqm

The AI-assisted searches sometimes returned price ranges, while the
structured dataset retains one selected value per study area. These
single values should not be interpreted as exact averages of all
available listings. Sources included Nigeria Property Centre and, for
the Pedro / Gbagada observation, an Instagram listing referenced by the
AI-assisted search.

### Challenges and learning

-   I initially used an incorrect working-directory path in Colab and
    corrected it.
-   The notebook expected `ward`, but the GeoJSON used `wardname`. I
    inspected the GeoJSON structure and updated the workflow.
-   I learned that asking prices can vary with exact location, access,
    plot size, title, existing structures and listing conditions.
-   AI-assisted collection made the search faster, but the results still
    required human inspection.

📷 **IMAGE INDICATION --- Insert a screenshot of the Sprint 2
`market_dataset.csv` table here**

*Suggested caption: Figure 2. Structured asking-price observations
collected during Sprint 2.*

# 4. From Market Data to Market Intelligence --- Sprint 3

Sprint 3 joined the Sprint 2 market dataset to the five ward polygons
and created an **Indicative Market Level** for each ward. The workflow
checked the expected locations, required fields and numeric prices
before mapping the values.

Each ward had only one market-price observation (`n = 1`), so the
Indicative Market Level was set to that selected Sprint 2 price. These
are not statistically robust ward-level averages.

  Ward                     Indicative Market Level
  ---------------------- -------------------------
  Pedro / Gbagada                   ₦1,200,000/sqm
  Aiyetoro / Mafowoku                 ₦420,000/sqm
  Ibuowo / Owotutu                    ₦415,000/sqm
  Ilaje                               ₦320,000/sqm
  Owode / Orile Bariga                ₦250,000/sqm

Across the five observations, the mean was ₦521,000/sqm, the median was
₦415,000/sqm, the minimum was ₦250,000/sqm and the maximum was
₦1,200,000/sqm. Pedro / Gbagada was flagged by the IQR screening as an
unusually high observation. This flag is a reason to validate the
evidence, not proof that the value is wrong.

📷 **IMAGE INDICATION --- Insert `indicative_market_levels.png` here**

*Suggested caption: Figure 3. Comparison of indicative land-market
levels across the five wards.*

📷 **IMAGE INDICATION --- Insert `bariga_market_intelligence_map.png`
here**

*Suggested caption: Figure 4. Spatial distribution of the Sprint 3
indicative market levels.*

The interactive market map is saved as
`bariga_market_intelligence_map.html`.

# 5. From Satellite Imagery to Spatial Intelligence --- Sprint 4

## 5.1 Objective and method

Sprint 4 investigated the observed physical environment in the same five
wards using satellite imagery for 2016 and 2026. I used the supplied
GeoRAD Google Colab / Google Earth Engine workflow rather than building
the processing pipeline from scratch.

The notebook's standardized settings were:

  -----------------------------------------------------------------------
  Setting                             Workflow configuration
  ----------------------------------- -----------------------------------
  Earlier year                        2016

  Recent year                         2026

  Imagery source                      Landsat 8/9 Collection 2 Level-2
                                      Surface Reflectance

  Cloud filtering                     Metadata cloud cover below 40%,
                                      with QA-based cloud/shadow masking

  Development proxy                   Percentage of pixels with NDBI
                                      greater than the threshold

  NDBI threshold                      0.0 for the main run

  Analysis scale                      30 metres
  -----------------------------------------------------------------------

NDBI is the Normalized Difference Built-up Index. Under this teaching
workflow, a pixel with NDBI above 0.0 is counted as a developed pixel.
The percentage of such pixels within each ward is used as the observed
development measure.

The notebook calculates:

**Development Change = 2026 Development (%) − 2016 Development (%)**

The result is reported in **percentage points (pp)**. For example, a
change from 80% to 70% is −10 percentage points, not a −10% relative
change.

## 5.2 Development Change results

The main run produced the following dataset:

  Ward                     2016 Development   2026 Development   Development Change
  ---------------------- ------------------ ------------------ --------------------
  Aiyetoro / Mafowoku               100.00%            100.00%              0.00 pp
  Ibuowo / Owotutu                   96.53%             95.18%             −1.36 pp
  Ilaje                              93.62%             90.13%             −3.48 pp
  Owode / Orile Bariga               97.64%             91.79%             −5.86 pp
  Pedro / Gbagada                    83.28%             66.01%            −17.27 pp

*Note: the change values are calculated from the underlying values and
rounded for display, so subtracting two displayed percentages may differ
slightly from the displayed change due to rounding.*

The largest decrease in the calculated indicator was in Pedro / Gbagada
(−17.27 pp). Aiyetoro / Mafowoku had no measured change in the output
because the indicator was 100% in both years. The other three wards
showed smaller decreases.

These results describe the output of the specified NDBI threshold
method. A negative result does **not** automatically mean that buildings
were demolished or that physical development declined. NDBI is a
spectral proxy and can be affected by surface materials, moisture,
vegetation, seasonal conditions, imagery availability and processing
choices.

📷 **IMAGE INDICATION --- Insert the 2016 NDBI inspection screenshot for
Pedro / Gbagada here**

*Suggested caption: Figure 5. NDBI inspection layer for Pedro / Gbagada
for 2016.*

📷 **IMAGE INDICATION --- Insert the 2026 NDBI inspection screenshot for
Pedro / Gbagada here**

*Suggested caption: Figure 6. NDBI inspection layer for Pedro / Gbagada
for 2026.*

📷 **IMAGE INDICATION --- Insert the 2016 and 2026 NDBI inspection
screenshots for Aiyetoro / Mafowoku here**

*Suggested caption: Figure 7. Visual inspection of the NDBI layers for
Aiyetoro / Mafowoku in 2016 and 2026.*

The screenshots showed spatial variation in the NDBI overlays, but
visual inspection alone did not establish the physical cause of the
calculated changes. Aiyetoro / Mafowoku's 100% result in both years
deserves further validation because a value at the upper limit can
conceal differences in the underlying imagery.

## 5.3 Development Change Indicator

The supplied notebook uses these GeoRAD teaching thresholds:

-   **Low:** Development Change below 5 percentage points
-   **Average:** Development Change from 5 to less than 15 percentage
    points
-   **High:** Development Change of 15 percentage points or more

Using the notebook's signed-change rules, all five results were
classified as `Low`, because all calculated changes were below 5
pp. This includes negative values.

This classification must be interpreted carefully: `Low` is the label
returned by the supplied threshold function, not evidence that every
ward experienced only a small change in magnitude. Pedro / Gbagada has
the largest absolute change in the dataset. The classification rules are
teaching defaults rather than a formal planning standard, and their
intended interpretation should be confirmed with GeoRAD if the product
indicator is meant to represent magnitude regardless of direction.

📷 **IMAGE INDICATION --- Insert `development_change_bar.png` here**

*Suggested caption: Figure 8. Observed Development Change between 2016
and 2026 across the five wards.*

📷 **IMAGE INDICATION --- Insert a screenshot of the interactive
`development_change_map.html` here**

*Suggested caption: Figure 9. Development Change values mapped to the
five ward polygons.*

## 5.4 Experiment: NDBI threshold sensitivity

For the required experiment, I changed the NDBI threshold from the
main-run value of 0.0 to a stricter value of +0.05 and a more relaxed
value of −0.05. I expected a stricter threshold to count fewer pixels as
developed and a relaxed threshold to count more pixels.

The observed Development Change values were:

  Ward                     Threshold +0.05   Threshold −0.05
  ---------------------- ----------------- -----------------
  Ibuowo / Owotutu                −3.09 pp          −1.70 pp
  Ilaje                           −0.21 pp          +0.36 pp
  Pedro / Gbagada                −15.65 pp          −9.99 pp
  Aiyetoro / Mafowoku             −1.97 pp           0.00 pp
  Owode / Orile Bariga            −8.16 pp          −3.63 pp

The results confirmed that the threshold affects the estimated
development percentages and change values. Pedro / Gbagada still showed
the largest decrease under both alternative thresholds, while Ilaje
changed from a slight decrease at +0.05 to a slight increase at −0.05.
This suggests that the interpretation of small changes can be sensitive
to the selected threshold.

The experiment does not establish which threshold is universally
correct. The official main result remains the run at NDBI threshold 0.0
unless GeoRAD instructs otherwise.

📷 **IMAGE INDICATION --- Insert a screenshot of the threshold
sensitivity experiment tables here**

*Suggested caption: Figure 10. Sensitivity of Development Change results
to alternative NDBI thresholds.*

## 5.5 Additional temporal inspection

The notebook also calculated a 2022 value to provide an intermediate
point between 2016 and 2026:

  Ward                        2016      2022      2026
  ---------------------- --------- --------- ---------
  Ibuowo / Owotutu          96.53%    98.00%    95.18%
  Ilaje                     93.62%    93.89%    90.13%
  Pedro / Gbagada           83.28%    84.30%    66.01%
  Aiyetoro / Mafowoku      100.00%   100.00%   100.00%
  Owode / Orile Bariga      97.64%    97.18%    91.79%

The intermediate values help show that the observed series is not always
a steady decline. For example, Ibuowo / Owotutu and Pedro / Gbagada have
higher calculated values in 2022 than in 2016, followed by lower values
in 2026. This should be treated as a reason to investigate the imagery
and measurement conditions, not as proof of a particular
physical-development history.

## 5.6 Limitations and quality-control notes

1.  The development measure is a thresholded NDBI proxy, not a direct
    building count or formal land-use classification.
2.  The percentage can be affected by surface materials, moisture,
    vegetation, seasonal differences, clouds, sensor differences and
    image availability.
3.  The 2026 calendar year is not complete as of 10 October 2026. The
    2026 composite therefore reflects imagery available up to the run
    date, rather than a full-year observation. This limits direct
    comparability with the full 2016 period.
4.  Aiyetoro / Mafowoku reaches 100% in all three inspected years in the
    main run. This upper-limit result should be validated rather than
    interpreted automatically as no physical change.
5.  The classification function uses signed Development Change.
    Consequently, all negative values fall into `Low` under the provided
    thresholds. This is a limitation of the current product-facing
    classification if the intent is to represent change magnitude
    independent of direction.
6.  The notebook's fallback for unavailable pixel statistics should be
    reviewed before future production use so that missing measurements
    are not inadvertently interpreted as zero.
7.  The five wards are the study areas; findings should not be
    generalized to all of Bariga or Lagos.
8.  Sprint 2 has one selected asking-price observation per ward. Market
    data and the satellite proxy are different kinds of evidence and do
    not establish a causal relationship.

# 6. Combined Observations Across the Sprints

The first four sprints produced two separate signals:

-   **Market signal:** one indicative asking-price observation per ward,
    carried forward as the Sprint 3 Indicative Market Level.
-   **Development signal:** observed change in the percentage of pixels
    above the NDBI threshold between the 2016 and 2026 imagery periods.

Pedro / Gbagada has both the highest selected asking-price signal in
Sprint 3 and the largest negative NDBI-based Development Change in the
Sprint 4 main run. This is an observation across two different measures,
not evidence that high land prices cause development change or that the
satellite result explains the asking price. Both signals have
limitations and require further validation.

The next stage of the project can bring these independent signals
together in the Land Intelligence product, while clearly preserving what
each metric measures and its limitations.

# 7. Project Outputs

### Spatial inputs

-   `bariga_selected_wards.geojson` --- five selected ward polygons
-   `bariga_lcda.geojson` --- dissolved working Bariga boundary, where
    retained

### Sprint 2--3 market outputs

-   `market_dataset.csv` --- Sprint 2 asking-price dataset
-   `market_intelligence.csv` and `market_intelligence.json` --- Sprint
    3 market-intelligence outputs
-   `market_comparison.csv` --- Sprint 3 comparison statistics
-   `bariga_market_intelligence_map.html` --- interactive market map
-   `bariga_market_intelligence_map.png` --- static market map
-   `indicative_market_levels.png` --- Sprint 3 comparison chart

### Sprint 4 development outputs

-   `development_change.csv` --- main Development Change dataset
-   `development_change.json` --- JSON version of the dataset
-   `development_change_bar.png` --- Development Change chart
-   `development_change_map.html` --- interactive Development Change map
-   `towns_orientation_map.html` --- study-area orientation map
-   NDBI inspection maps for the selected ward and year
-   Threshold-sensitivity experiment tables
-   2016/2022/2026 development timeline table

### Notebooks

-   Sprint 2 market-data notebook
-   Sprint 3 market-intelligence notebook
-   Sprint 4 satellite-imagery and Development Change notebook

# 8. Reproducibility

The Sprint 4 analysis was run in Google Colab using Google Earth Engine.

To reproduce the main run:

1.  Open the Sprint 4 notebook.
2.  Authenticate Google Earth Engine using the configured Cloud project.
3.  Upload `bariga_selected_wards.geojson`.
4.  Confirm that the notebook detects `wardname` and loads five polygon
    features.
5.  Run the analysis using the standardized 2016/2026 settings and NDBI
    threshold 0.0.
6.  Inspect the development table, chart, map and NDBI layers.
7.  Run the threshold experiment separately and retain the original
    main-run results.
8.  Export the CSV and JSON outputs and save relevant screenshots.

The results should be interpreted with the limitations described above,
especially the incomplete 2026 calendar year and the fact that NDBI is a
proxy rather than a direct building detector.

# 9. Overall Learning

Sprint 1 taught me to validate administrative boundaries and spatial
attributes carefully. Sprint 2 showed me how to connect market
information to spatial study areas while checking AI-assisted search
results. Sprint 3 turned the selected asking-price observations into a
spatial market-intelligence layer. Sprint 4 introduced satellite imagery
and a standardized NDBI-based method for measuring observed change over
time.

The most important lesson from Sprint 4 was that running a geospatial
workflow is only one part of the work. I also needed to inspect the
imagery, experiment with the threshold, and be careful not to interpret
a change in a spectral proxy as direct proof of buildings being added or
removed.
