import sys
sys.path.insert(0, 'd:/Projects/CapstoneProject/System/TRY_05/pulmoscan/backend')
from app.services.ml_service import get_ml_service
svc = get_ml_service()

# Only the fields the form sends (matching DEFAULTS + what the user fills in)
# Missing imaging fields will use defaults in ml_service _encode()

cases = [
    # ── REAL SAMPLES (from dataset, rule-matched) ──────────────────────
    {
        "label":   "No Cancer",
        "source":  "Dataset",
        "name":    "Jean Bosco Nshimiyimana",
        "patient_age": 72,        "patient_gender": "Male",
        "smoking_history": "Former",  "family_history": 0,
        "nodule_size_mm": 2.2,    "tumor_location": "Right Lung",
        "tumor_stage": "Stage I",
        "EGFR_mutation_status": 0, "KRAS_mutation_status": 0, "ALK_fusion_status": 0,
        "PD_L1_expression_level": 42.0, "tumor_mutational_burden": 13.0,
    },
    {
        "label":   "Adenocarcinoma",
        "source":  "Dataset",
        "name":    "Alice Uwimana",
        "patient_age": 40,        "patient_gender": "Male",
        "smoking_history": "Former",  "family_history": 0,
        "nodule_size_mm": 5.9,    "tumor_location": "Right Lung",
        "tumor_stage": "Stage II",
        "EGFR_mutation_status": 1, "KRAS_mutation_status": 0, "ALK_fusion_status": 0,
        "PD_L1_expression_level": 33.0, "tumor_mutational_burden": 2.0,
    },
    {
        "label":   "SCLC",
        "source":  "Dataset",
        "name":    "Pierre Habimana",
        "patient_age": 43,        "patient_gender": "Male",
        "smoking_history": "Current", "family_history": 0,
        "nodule_size_mm": 17.3,   "tumor_location": "Left Lung",
        "tumor_stage": "Stage IV",
        "EGFR_mutation_status": 0, "KRAS_mutation_status": 0, "ALK_fusion_status": 0,
        "PD_L1_expression_level": 21.0, "tumor_mutational_burden": 1.6,
    },
    {
        "label":   "Squamous Cell",
        "source":  "Dataset",
        "name":    "Marie Claire Mukamana",
        "patient_age": 54,        "patient_gender": "Female",
        "smoking_history": "Former",  "family_history": 0,
        "nodule_size_mm": 1.7,    "tumor_location": "Right Lung",
        "tumor_stage": "Stage II",
        "EGFR_mutation_status": 0, "KRAS_mutation_status": 0, "ALK_fusion_status": 0,
        "PD_L1_expression_level": 75.0, "tumor_mutational_burden": 4.9,
    },
    {
        "label":   "Other",
        "source":  "Dataset",
        "name":    "Emmanuel Nkurunziza",
        "patient_age": 74,        "patient_gender": "Male",
        "smoking_history": "Former",  "family_history": 0,
        "nodule_size_mm": 0.3,    "tumor_location": "Right Lung",
        "tumor_stage": "Stage IV",
        "EGFR_mutation_status": 0, "KRAS_mutation_status": 0, "ALK_fusion_status": 0,
        "PD_L1_expression_level": 16.0, "tumor_mutational_burden": 26.0,
    },
    # ── SYNTHETIC SAMPLES (outside dataset) ───────────────────────────
    {
        "label":   "No Cancer",
        "source":  "Synthetic",
        "name":    "Sophie Ingabire",
        "patient_age": 35,        "patient_gender": "Female",
        "smoking_history": "Never",   "family_history": 0,
        "nodule_size_mm": 3.0,    "tumor_location": "Right Lung",
        "tumor_stage": "Stage I",
        "EGFR_mutation_status": 0, "KRAS_mutation_status": 0, "ALK_fusion_status": 0,
        "PD_L1_expression_level": 5.0, "tumor_mutational_burden": 2.0,
    },
    {
        "label":   "Adenocarcinoma",
        "source":  "Synthetic",
        "name":    "Grace Mukamurera",
        "patient_age": 52,        "patient_gender": "Female",
        "smoking_history": "Never",   "family_history": 1,
        "nodule_size_mm": 18.0,   "tumor_location": "Left Lung",
        "tumor_stage": "Stage II",
        "EGFR_mutation_status": 1, "KRAS_mutation_status": 0, "ALK_fusion_status": 1,
        "PD_L1_expression_level": 28.0, "tumor_mutational_burden": 4.5,
    },
    {
        "label":   "SCLC",
        "source":  "Synthetic",
        "name":    "Robert Nsengiyumva",
        "patient_age": 61,        "patient_gender": "Male",
        "smoking_history": "Current", "family_history": 1,
        "nodule_size_mm": 35.0,   "tumor_location": "Central",
        "tumor_stage": "Stage IV",
        "EGFR_mutation_status": 0, "KRAS_mutation_status": 0, "ALK_fusion_status": 0,
        "PD_L1_expression_level": 10.0, "tumor_mutational_burden": 8.0,
    },
    {
        "label":   "Squamous Cell",
        "source":  "Synthetic",
        "name":    "David Mugisha",
        "patient_age": 67,        "patient_gender": "Male",
        "smoking_history": "Current", "family_history": 0,
        "nodule_size_mm": 22.0,   "tumor_location": "Right Lung",
        "tumor_stage": "Stage III",
        "EGFR_mutation_status": 0, "KRAS_mutation_status": 1, "ALK_fusion_status": 0,
        "PD_L1_expression_level": 68.0, "tumor_mutational_burden": 9.5,
    },
    {
        "label":   "Other",
        "source":  "Synthetic",
        "name":    "Claudine Uwase",
        "patient_age": 48,        "patient_gender": "Female",
        "smoking_history": "Never",   "family_history": 0,
        "nodule_size_mm": 12.0,   "tumor_location": "Bilateral",
        "tumor_stage": "Stage II",
        "EGFR_mutation_status": 0, "KRAS_mutation_status": 0, "ALK_fusion_status": 0,
        "PD_L1_expression_level": 22.0, "tumor_mutational_burden": 28.5,
    },
]

print("=" * 70)
print("  SAMPLE DATA — FORM FIELDS ONLY + CODEBASE PREDICTION")
print("=" * 70)

for i, c in enumerate(cases, 1):
    patient = {k: v for k, v in c.items() if k not in ("label","source","name")}
    result  = svc.predict(patient)
    pred    = result["subtype_prediction"]
    conf    = result["confidence_score"] * 100
    risk    = result["risk_level"]
    probs   = result["class_probabilities"]
    top3    = sorted(probs.items(), key=lambda x: x[1], reverse=True)[:3]
    match   = "CORRECT" if pred == c["label"] else "WRONG"

    egfr = "Positive" if c["EGFR_mutation_status"] else "Negative"
    kras = "Positive" if c["KRAS_mutation_status"] else "Negative"
    alk  = "Positive" if c["ALK_fusion_status"] else "Negative"
    fhx  = "Positive" if c["family_history"] else "Negative"

    print(f"\nCase {i:02d} | Expected: {c['label']:<15} | Source: {c['source']}")
    print(f"  {'Patient Name':<28} {c['name']}")
    print(f"  {'Age':<28} {c['patient_age']}")
    print(f"  {'Gender':<28} {c['patient_gender']}")
    print(f"  {'Smoking History':<28} {c['smoking_history']}")
    print(f"  {'Family History':<28} {fhx}")
    print(f"  {'Nodule Size (mm)':<28} {c['nodule_size_mm']}")
    print(f"  {'Tumour Location':<28} {c['tumor_location']}")
    print(f"  {'Tumour Stage':<28} {c['tumor_stage']}")
    print(f"  {'EGFR Mutation':<28} {egfr}")
    print(f"  {'KRAS Mutation':<28} {kras}")
    print(f"  {'ALK Fusion':<28} {alk}")
    print(f"  {'PD-L1 Expression (%)':<28} {c['PD_L1_expression_level']}")
    print(f"  {'Tumour Mutational Burden':<28} {c['tumor_mutational_burden']}")
    print(f"  --- Codebase Result ---")
    print(f"  {'Predicted Subtype':<28} {pred}  [{match}]")
    print(f"  {'Confidence':<28} {conf:.1f}%")
    print(f"  {'Risk Level':<28} {risk}")
    print(f"  {'Top Probabilities':<28} " + "  |  ".join([f"{k}: {v*100:.1f}%" for k, v in top3]))
