import sys
sys.path.insert(0, 'd:/Projects/CapstoneProject/System/TRY_05/pulmoscan/backend')
from app.services.ml_service import get_ml_service
svc = get_ml_service()

real_samples = {
    "No Cancer": {
        "patient_age": 72, "patient_gender": "Male", "smoking_history": "Former",
        "family_history": 0, "nodule_size_mm": 2.22, "nodule_texture": 0.45,
        "hu_mean": -527.4, "hu_std": 96.7, "glcm_contrast": 2.01,
        "glcm_correlation": 0.95, "pet_suvmax": 2.47, "pet_suvmean": 0.52,
        "tumor_location": "Right Lung", "tumor_stage": "Stage I",
        "radiation_therapy": 0, "chemotherapy_received": 1,
        "immunotherapy_received": 0, "targeted_therapy_received": 0,
        "egfr_mutation_status": 0, "kras_mutation_status": 0, "alk_fusion_status": 0,
        "pd_l1_expression_level": 42.3, "tumor_mutational_burden": 13.2,
        "cancer_presence": 1,
    },
    "Adenocarcinoma": {
        "patient_age": 40, "patient_gender": "Male", "smoking_history": "Former",
        "family_history": 0, "nodule_size_mm": 5.89, "nodule_texture": 0.47,
        "hu_mean": -36.6, "hu_std": 210.9, "glcm_contrast": 0.83,
        "glcm_correlation": 0.58, "pet_suvmax": 6.13, "pet_suvmean": 2.25,
        "tumor_location": "Right Lung", "tumor_stage": "Stage II",
        "radiation_therapy": 1, "chemotherapy_received": 0,
        "immunotherapy_received": 1, "targeted_therapy_received": 0,
        "egfr_mutation_status": 1, "kras_mutation_status": 0, "alk_fusion_status": 0,
        "pd_l1_expression_level": 32.9, "tumor_mutational_burden": 2.2,
        "cancer_presence": 0,
    },
    "SCLC": {
        "patient_age": 43, "patient_gender": "Male", "smoking_history": "Current",
        "family_history": 0, "nodule_size_mm": 17.28, "nodule_texture": 0.79,
        "hu_mean": -379.1, "hu_std": 111.1, "glcm_contrast": 4.50,
        "glcm_correlation": 0.91, "pet_suvmax": 1.08, "pet_suvmean": 1.44,
        "tumor_location": "Left Lung", "tumor_stage": "Stage IV",
        "radiation_therapy": 1, "chemotherapy_received": 0,
        "immunotherapy_received": 0, "targeted_therapy_received": 0,
        "egfr_mutation_status": 0, "kras_mutation_status": 0, "alk_fusion_status": 0,
        "pd_l1_expression_level": 20.9, "tumor_mutational_burden": 1.6,
        "cancer_presence": 1,
    },
    "Squamous Cell": {
        "patient_age": 54, "patient_gender": "Female", "smoking_history": "Former",
        "family_history": 0, "nodule_size_mm": 1.65, "nodule_texture": 0.13,
        "hu_mean": -772.2, "hu_std": 15.5, "glcm_contrast": 1.08,
        "glcm_correlation": 0.67, "pet_suvmax": 0.26, "pet_suvmean": 1.93,
        "tumor_location": "Right Lung", "tumor_stage": "Stage II",
        "radiation_therapy": 0, "chemotherapy_received": 1,
        "immunotherapy_received": 0, "targeted_therapy_received": 0,
        "egfr_mutation_status": 1, "kras_mutation_status": 0, "alk_fusion_status": 0,
        "pd_l1_expression_level": 74.9, "tumor_mutational_burden": 4.9,
        "cancer_presence": 1,
    },
    "Other": {
        "patient_age": 74, "patient_gender": "Male", "smoking_history": "Former",
        "family_history": 0, "nodule_size_mm": 0.34, "nodule_texture": 0.88,
        "hu_mean": -48.8, "hu_std": 133.2, "glcm_contrast": 5.14,
        "glcm_correlation": 0.83, "pet_suvmax": 0.46, "pet_suvmean": 5.61,
        "tumor_location": "Right Lung", "tumor_stage": "Stage IV",
        "radiation_therapy": 0, "chemotherapy_received": 0,
        "immunotherapy_received": 1, "targeted_therapy_received": 0,
        "egfr_mutation_status": 0, "kras_mutation_status": 0, "alk_fusion_status": 0,
        "pd_l1_expression_level": 16.5, "tumor_mutational_burden": 26.0,
        "cancer_presence": 1,
    },
}

synthetic_samples = {
    "No Cancer": {
        "patient_age": 35, "patient_gender": "Female", "smoking_history": "Never",
        "family_history": 0, "nodule_size_mm": 3.0, "nodule_texture": 0.25,
        "hu_mean": -600.0, "hu_std": 50.0, "glcm_contrast": 1.2,
        "glcm_correlation": 0.97, "pet_suvmax": 1.5, "pet_suvmean": 0.8,
        "tumor_location": "Right Lung", "tumor_stage": "Stage 0",
        "radiation_therapy": 0, "chemotherapy_received": 0,
        "immunotherapy_received": 0, "targeted_therapy_received": 0,
        "egfr_mutation_status": 0, "kras_mutation_status": 0, "alk_fusion_status": 0,
        "pd_l1_expression_level": 5.0, "tumor_mutational_burden": 2.0,
        "cancer_presence": 0,
    },
    "Adenocarcinoma": {
        "patient_age": 52, "patient_gender": "Female", "smoking_history": "Never",
        "family_history": 1, "nodule_size_mm": 18.0, "nodule_texture": 0.65,
        "hu_mean": -120.0, "hu_std": 180.0, "glcm_contrast": 3.5,
        "glcm_correlation": 0.72, "pet_suvmax": 9.8, "pet_suvmean": 4.2,
        "tumor_location": "Left Lung", "tumor_stage": "Stage II",
        "radiation_therapy": 0, "chemotherapy_received": 0,
        "immunotherapy_received": 0, "targeted_therapy_received": 1,
        "egfr_mutation_status": 1, "kras_mutation_status": 0, "alk_fusion_status": 1,
        "pd_l1_expression_level": 28.0, "tumor_mutational_burden": 4.5,
        "cancer_presence": 1,
    },
    "SCLC": {
        "patient_age": 61, "patient_gender": "Male", "smoking_history": "Current",
        "family_history": 1, "nodule_size_mm": 35.0, "nodule_texture": 0.92,
        "hu_mean": -200.0, "hu_std": 220.0, "glcm_contrast": 7.8,
        "glcm_correlation": 0.88, "pet_suvmax": 14.5, "pet_suvmean": 8.3,
        "tumor_location": "Central", "tumor_stage": "Stage IV",
        "radiation_therapy": 0, "chemotherapy_received": 1,
        "immunotherapy_received": 0, "targeted_therapy_received": 0,
        "egfr_mutation_status": 0, "kras_mutation_status": 0, "alk_fusion_status": 0,
        "pd_l1_expression_level": 10.0, "tumor_mutational_burden": 8.0,
        "cancer_presence": 1,
    },
    "Squamous Cell": {
        "patient_age": 67, "patient_gender": "Male", "smoking_history": "Current",
        "family_history": 0, "nodule_size_mm": 22.0, "nodule_texture": 0.78,
        "hu_mean": -300.0, "hu_std": 160.0, "glcm_contrast": 5.6,
        "glcm_correlation": 0.81, "pet_suvmax": 11.2, "pet_suvmean": 5.9,
        "tumor_location": "Right Lung", "tumor_stage": "Stage III",
        "radiation_therapy": 0, "chemotherapy_received": 1,
        "immunotherapy_received": 1, "targeted_therapy_received": 0,
        "egfr_mutation_status": 0, "kras_mutation_status": 1, "alk_fusion_status": 0,
        "pd_l1_expression_level": 68.0, "tumor_mutational_burden": 9.5,
        "cancer_presence": 1,
    },
    "Other": {
        "patient_age": 48, "patient_gender": "Female", "smoking_history": "Never",
        "family_history": 0, "nodule_size_mm": 12.0, "nodule_texture": 0.55,
        "hu_mean": -90.0, "hu_std": 145.0, "glcm_contrast": 4.2,
        "glcm_correlation": 0.76, "pet_suvmax": 7.3, "pet_suvmean": 3.8,
        "tumor_location": "Bilateral", "tumor_stage": "Stage II",
        "radiation_therapy": 0, "chemotherapy_received": 0,
        "immunotherapy_received": 0, "targeted_therapy_received": 0,
        "egfr_mutation_status": 0, "kras_mutation_status": 0, "alk_fusion_status": 0,
        "pd_l1_expression_level": 22.0, "tumor_mutational_burden": 28.5,
        "cancer_presence": 1,
    },
}

print("=" * 70)
print("  CODEBASE PREDICTIONS — REAL SAMPLES (from dataset)")
print("=" * 70)
for label, patient in real_samples.items():
    result = svc.predict(patient)
    pred = result["subtype_prediction"]
    conf = result["confidence_score"] * 100
    risk = result["risk_level"]
    probs = result["class_probabilities"]
    top3 = sorted(probs.items(), key=lambda x: x[1], reverse=True)[:3]
    match = "CORRECT" if pred == label else "WRONG"
    print(f"\n  [{label}]  ->  Predicted: {pred}  ({conf:.1f}%)  Risk: {risk}  [{match}]")
    print("  Top probs: " + "  |  ".join([f"{k}: {v*100:.1f}%" for k, v in top3]))

print()
print("=" * 70)
print("  CODEBASE PREDICTIONS — SYNTHETIC SAMPLES (outside dataset)")
print("=" * 70)
for label, patient in synthetic_samples.items():
    result = svc.predict(patient)
    pred = result["subtype_prediction"]
    conf = result["confidence_score"] * 100
    risk = result["risk_level"]
    probs = result["class_probabilities"]
    top3 = sorted(probs.items(), key=lambda x: x[1], reverse=True)[:3]
    match = "CORRECT" if pred == label else "WRONG"
    print(f"\n  [{label}]  ->  Predicted: {pred}  ({conf:.1f}%)  Risk: {risk}  [{match}]")
    print("  Top probs: " + "  |  ".join([f"{k}: {v*100:.1f}%" for k, v in top3]))
