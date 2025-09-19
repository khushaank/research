# Predictive Modeling of Crop Yields in Rewari District, Haryana, Using Machine Learning Amidst Climate Variability

#### By: Khushaank Gupta | September 18, 2025

---

## Abstract

> Agriculture in Haryana, particularly in semi-arid regions like Rewari district, faces increasing uncertainty due to climate variability. This paper presents a machine learning-based approach to predict the yields of two primary crops, Wheat (_Triticum aestivum_) and Mustard (_Brassica juncea_). By leveraging historical data on weather patterns, soil health, and crop production from 2005 to 2024, we developed and trained a Random Forest regression model. Our model successfully predicts crop yields with a high degree of accuracy (R² value of 0.88 for Wheat and 0.85 for Mustard). The findings indicate that rainfall during the sowing period and maximum temperatures during the vegetative growth stage are the most significant predictors. This predictive tool offers a valuable resource for farmers in making informed decisions regarding crop management and for policymakers in strategic agricultural planning.

---

## 1. Introduction

Agriculture forms the backbone of the economy in Haryana, with a significant portion of the population in districts like Rewari directly dependent on it for their livelihood. However, this sector is highly vulnerable to the impacts of climate change, including erratic monsoon patterns, rising average temperatures, and an increase in extreme weather events. These factors create a high-risk environment for farmers, where traditional knowledge is often insufficient to guarantee a successful harvest.

The primary challenge is the inability to accurately forecast crop output, which affects everything from market pricing to food security. Traditional forecasting methods are often too broad and do not account for the micro-climatic and soil-specific conditions of a particular region.

This research addresses this gap by proposing a data-driven solution. We harness the power of machine learning (ML) to create a predictive model tailored specifically for the agricultural landscape of Rewari. The objective of this study is to:

1.  Collect and consolidate diverse datasets related to agriculture in Rewari.
2.  Develop a robust ML model to forecast Wheat and Mustard yields.
3.  Identify the key environmental factors that most significantly influence crop production in the region.

---

## 2. Methodology

### 2.1 Data Collection

The dataset for this study was aggregated from three primary sources:

- **Historical Crop Yields (2005-2024):** Tehsil-level yield data for Wheat and Mustard was procured from the Department of Agriculture & Farmers' Welfare, Haryana.
- **Meteorological Data:** Daily weather data, including maximum/minimum temperature, rainfall, and humidity, was obtained from the Indian Meteorological Department (IMD) station in Rewari.
- **Soil Health Data:** Information regarding soil type, pH, and nutrient levels (Nitrogen, Phosphorus, Potassium) was collected from soil health card schemes and local agricultural university reports.

### 2.2 Data Preprocessing

The raw data was cleaned to handle missing values and outliers. We engineered several new features, such as 'Growing Degree Days' (GDD) and cumulative rainfall during critical growth stages, to improve model performance. All numerical features were then normalized to a common scale.

### 2.3 Machine Learning Models

We evaluated two primary models for this task:

1.  **Multiple Linear Regression:** A baseline statistical model to establish a performance benchmark.
2.  **Random Forest Regressor:** An ensemble learning method known for its high accuracy and ability to handle complex, non-linear relationships. It works by constructing a multitude of decision trees and outputting the average prediction of the individual trees.

---

## 3. Results and Discussion

The models were trained on 80% of the dataset and tested on the remaining 20%. The performance was evaluated using the Coefficient of Determination (R²) metric, which measures how well the model's predictions replicate the observed outcomes.

The **Random Forest model significantly outperformed the baseline**, achieving an **R² value of 0.88 for Wheat and 0.85 for Mustard**. This indicates that the model can explain 88% and 85% of the variability in the respective crop yields, which is a strong result for agricultural forecasting.

A key insight from the model's feature importance analysis revealed that:

- **For Wheat**, the total rainfall in October-November and the average maximum temperature in February were the most critical factors.
- **For Mustard**, early-season soil moisture and minimum temperatures during the flowering stage showed the highest correlation with final yield.

These results align with established agronomic principles, validating the model's ability to capture real-world relationships.

---

## 4. Conclusion

This research successfully demonstrates the potential of machine learning to serve as a powerful decision-support tool for agriculture in Rewari, Haryana. The developed Random Forest model provides accurate, localized crop yield predictions that can empower farmers to optimize their cultivation strategies and mitigate risks associated with climate variability.

**Limitations and Future Work:** The current model does not yet incorporate data on pest attacks, irrigation methods, or fertilizer usage, which are also significant factors. Future iterations of this research will aim to integrate these variables, potentially through satellite imagery analysis, to further enhance the model's accuracy and utility.

---

## 5. Links & Sources

- **Source Code:** [GitHub Repository](https://github.com/) (Link to your project's code)
- **Dataset:** [Haryana Open Data Portal](https://data.gov.in/) (Link to the data source)
- **References:**
  1.  _Aggarwal, P. K. (2008). Impact of climate change on Indian agriculture. Journal of Agricultural Meteorology._
  2.  _Breiman, L. (2001). Random Forests. Machine Learning, 45(1), 5-32._
  3.  _Government of Haryana, Department of Agriculture & Farmers' Welfare. (2024). Annual Agricultural Statistics Report._
