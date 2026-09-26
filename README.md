## Bariga Land Value Intelligence Project

This project is part of the GeoRAD Academy Emerging Spatial Professional
mentorship technical sprint.

The focus of Sprint 2 was to move from the spatial questions defined in
Sprint 1 to actual market information by using an AI-assisted search
workflow to investigate current land asking prices across five selected
study areas in Bariga, Lagos.

------------------------------------------------------------------------

## 1. Project Objective

The objective of this sprint was to use an existing AI-enabled search
workflow to investigate the current land market across five selected
study areas and produce a simple, structured market dataset.

The workflow was designed to return:

-   **Town** --- name of the assigned study area
-   **Current Land Price/sqm** --- an indicative asking-price level in
    ₦/sqm
-   **Supporting Source** --- a source or listing supporting the
    reported market information
-   **Date Searched** --- date on which the market search was conducted

The results are intended as an indicative market signal and not as a
formal property valuation or prediction of future land prices.

------------------------------------------------------------------------

## 2. Study Areas

The five study areas used as inputs for the workflow were derived from
the five selected ward polygons prepared during Sprint 1:

1.  Ibuowo / Owotutu
2.  Ilaje
3.  Pedro / Gbagada
4.  Aiyetoro / Mafowoku
5.  Owode / Orile Bariga

The GeoJSON input used by the notebook was:

`bariga_selected_wards.geojson`

The notebook extracts the `wardname` attribute from these spatial
features and uses the resulting names as the market-search inputs.

------------------------------------------------------------------------

## 3. Problem the Notebook Solves

The notebook investigates the question:

> **What is the current asking price of residential land per square
> metre in each selected study area?**

Rather than manually searching for market information separately for
each location, the notebook automates the search process using an
AI-assisted Google search workflow.

The workflow searches for relevant online market information, retrieves
the available AI Overview, identifies market-price information and
supporting references, and structures the results into a dataset that
can be used in subsequent analysis.

------------------------------------------------------------------------

## 4. Tools and Technologies Used

  -----------------------------------------------------------------------
  Tool / Technology                   Purpose
  ----------------------------------- -----------------------------------
  **Google Colab**                    Running and adapting the provided
                                      GeoRAD notebook

  **Python**                          Processing the spatial inputs and
                                      search results

  **GeoJSON**                         Providing the five selected
                                      study-area polygons

  **SerpApi**                         Performing Google searches and
                                      retrieving search/AI Overview
                                      information

  **Google AI Overview**              Providing an AI-assisted summary of
                                      available market information

  **Pandas**                          Structuring and exporting the
                                      market dataset

  **CSV / JSON**                      Storing the generated market
                                      results
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## 5. Input Data

The main spatial input was:

``` text
bariga_selected_wards.geojson
```

This file contains the five selected ward polygons from the Bariga study
area.

The workflow uses the `wardname` field to obtain the names of the study
areas.

The five inputs were:

    \# Study Area
  ---- ----------------------
     1 Ibuowo / Owotutu
     2 Ilaje
     3 Pedro / Gbagada
     4 Aiyetoro / Mafowoku
     5 Owode / Orile Bariga

------------------------------------------------------------------------

## 6. Search Question

The starting market question supplied by GeoRAD was adapted for the
selected locations.

The customized search pattern used in the notebook was:

``` text
Current asking price of residential land per sqm in [Town], Shomolu Lagos Nigeria
```

The location name was inserted dynamically for each of the five study
areas.

------------------------------------------------------------------------

## 7. How the Workflow Works

The workflow can be summarized as:

``` text
Five selected ward polygons
          ↓
Load GeoJSON
          ↓
Read the wardname field
          ↓
Generate a market-search question
          ↓
Search Google through SerpApi
          ↓
Retrieve available AI Overview
          ↓
Extract market-price information
          ↓
Collect supporting references
          ↓
Record search date
          ↓
Generate structured market dataset
```

The notebook processes the five study areas and produces structured
results containing the town, indicative price, supporting source and
search date.

------------------------------------------------------------------------

## 8. Generated Market Dataset

The completed workflow returned a market-price value for all five study
areas.

  ------------------------------------------------------------------------
  Study Area          Indicative Current Supporting       Date Searched
                          Land Price/sqm Source           
  ---------------- --------------------- ---------------- ----------------
  Ibuowo / Owotutu          ₦415,000/sqm Nigeria Property 2026-09-26
                                         Centre           

  Ilaje                     ₦320,000/sqm Nigeria Property 2026-09-26
                                         Centre           

  Pedro / Gbagada         ₦1,200,000/sqm Instagram        2026-09-26
                                         listing          

  Aiyetoro /                ₦420,000/sqm Nigeria Property 2026-09-26
  Mafowoku                               Centre           

  Owode / Orile             ₦250,000/sqm Nigeria Property 2026-09-26
  Bariga                                 Centre           
  ------------------------------------------------------------------------

The generated market dataset is available in both CSV and JSON formats.

### Important interpretation note

The single price recorded in the generated dataset should not
automatically be interpreted as the average price of all land in the
study area.

The underlying AI Overview often returned a **range of observed asking
prices**, from which the generated workflow recorded a
representative/upper value.

For example:

-   **Ibuowo / Owotutu:** the AI result reported approximately
    ₦250,000--₦415,000/sqm.
-   **Ilaje:** approximately ₦200,000--₦320,000/sqm.
-   **Pedro / Gbagada:** approximately ₦200,000 to over ₦1,200,000/sqm.
-   **Aiyetoro / Mafowoku:** approximately ₦150,000--₦420,000/sqm.
-   **Owode / Orile Bariga:** approximately ₦95,000--₦250,000/sqm.

These ranges show that land asking prices can vary considerably within
the same study area.

------------------------------------------------------------------------

## 9. Supporting Market Evidence

The AI-assisted search returned supporting references for the generated
market information.

Examples include:

-   Nigeria Property Centre listings for land in Shomolu/Bariga
-   Jiji Nigeria property listings
-   Hutbay listings
-   Instagram property listings
-   Other online property sources returned through the search workflow

For example, the Ilaje search returned a Nigeria Property Centre listing
describing a 250 sqm parcel on Ilaje Road in Bariga at ₦80 million,
which corresponds to approximately ₦320,000/sqm. The AI result also
identified another larger redevelopment property at a lower approximate
rate.

The Pedro / Gbagada search returned several market references, including
a listing indicating ₦200,000/sqm and other listings with substantially
higher asking prices, demonstrating the variation within that broader
area.

------------------------------------------------------------------------

## 10. Issues Encountered During Setup

### 10.1 Working Directory / Folder Path

The first issue encountered was getting the Google Colab runtime to
access the correct project folder.

The folder path was initially misspelled, which meant that the notebook
could not correctly locate the working directory and required files.

After checking the path and correcting the folder name, the notebook was
able to access the required project files.

### 10.2 Incorrect Attribute Name

The second issue occurred during the first run of the notebook.

The original code referred to the location attribute as:

``` text
ward
```

However, the GeoJSON produced during Sprint 1 used:

``` text
wardname
```

Because of this mismatch, the initial run did not attach the study-area
names correctly.

After inspecting the structure of the GeoJSON output, I identified the
correct field name and changed the extraction logic to use:

``` python
feature.get("properties", {}).get("wardname")
```

After this correction, the five study-area names were correctly
extracted and passed into the market-search workflow.

------------------------------------------------------------------------

## 11. Inspection and Experimentation

The notebook was not treated as a black-box process. After the initial
run, the generated output was inspected to check whether:

-   all five study areas were processed;
-   each study area returned a market price;
-   the returned location matched the intended study area;
-   supporting sources were provided;
-   the price information was expressed in a usable unit;
-   any unexpected results or errors were present.

The initial field-name problem was identified through this inspection
process and corrected before the final run.

The AI results were also examined to understand whether the returned
price represented a range, a specific listing, or a broader market
summary.

------------------------------------------------------------------------

## 12. Limitations

### Asking Prices Are Not Transaction Prices

The results are based on online **asking prices** rather than confirmed
completed land transactions. They should therefore not be treated as
actual sale prices.

### Variation Within Study Areas

Prices vary according to factors such as:

-   road accessibility;
-   proximity to major roads;
-   plot size;
-   title documentation;
-   existing structures;
-   residential or commercial potential;
-   specific micro-location.

Therefore, one price cannot fully represent every property within a
ward.

### AI-Generated Summaries

The AI Overview provides a useful way to discover and summarize market
information, but the underlying listings remain important for
verification.

### Online Data Availability

The dataset only represents market information that was available and
discoverable online at the time of the search. It does not represent
every property listing in the five study areas.

### Search Date

Market asking prices can change. The results therefore include the date
searched so that the dataset can be interpreted within its time context.

------------------------------------------------------------------------

## 13. Output Files

The Sprint 2 workflow produced the following main outputs:

``` text
bariga_spatial_questions_to_market_data.ipynb
market_dataset.csv
market_dataset.json
ai_overview_raw.json
bariga_selected_wards.geojson
```

### File descriptions

  -------------------------------------------------------------------------------------
  File                                              Description
  ------------------------------------------------- -----------------------------------
  `bariga_spatial_questions_to_market_data.ipynb`   Customized Colab notebook
                                                    containing the Sprint 2 workflow

  `market_dataset.csv`                              Structured market dataset in CSV
                                                    format

  `market_dataset.json`                             Structured market dataset in JSON
                                                    format

  `ai_overview_raw.json`                            Raw AI Overview/search output and
                                                    supporting references

  `bariga_selected_wards.geojson`                   Five selected ward polygons used as
                                                    the spatial inputs
  -------------------------------------------------------------------------------------

------------------------------------------------------------------------

## 14. Key Learning

The main lesson from this sprint was that AI-assisted workflows can help
connect spatial information with non-spatial market information much
faster than performing every search manually.

However, automation does not remove the need for human checking. I had
to inspect the spatial input, identify the incorrect `ward` field,
correct it to `wardname`, and review whether the returned market
information actually supported the generated values.

The workflow also showed that a market question that appears simple ---
such as the current price of land per square metre --- can produce a
wide range of results because land prices depend heavily on the specific
property and its location.

This makes source checking and careful interpretation important when
using AI-assisted market data for spatial analysis.

------------------------------------------------------------------------

## 15. Conclusion

Sprint 2 successfully produced a structured indicative land-market
dataset for the five selected study areas in Bariga.

The workflow demonstrated how spatial features from the previous sprint
can be connected to an AI-assisted web-search process to obtain current
market information.

The resulting dataset will provide the market-price component for
subsequent stages of the Land Value Intelligence project, where it can
be considered alongside other spatial indicators and the planned
five-year development analysis.
