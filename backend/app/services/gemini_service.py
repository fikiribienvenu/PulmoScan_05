"""
PulmoScan AI v2 – Gemini Clinical Explanation Service
Generates doctor-friendly clinical interpretations for multi-class subtype predictions.
"""
import google.generativeai as genai
from typing import Optional, Dict, Any, List
from app.core.config import get_settings

settings = get_settings()

# Subtype clinical descriptions for richer prompts
SUBTYPE_DESC = {
    "Adenocarcinoma": (
        "Adenocarcinoma is the most common type of non-small cell lung cancer (NSCLC), "
        "typically arising in peripheral lung tissue. It is strongly associated with "
        "EGFR, ALK, and ROS1 mutations, making it highly amenable to targeted therapy."
    ),
    "Squamous Cell": (
        "Squamous cell carcinoma (SCC) is an NSCLC subtype originating in the bronchial "
        "epithelium. It is closely linked to smoking history and typically presents "
        "centrally. PD-L1 expression guides immunotherapy selection."
    ),
    "SCLC": (
        "Small cell lung cancer (SCLC) is a highly aggressive neuroendocrine tumour "
        "with rapid doubling time. It is almost exclusively associated with heavy smoking "
        "and typically presents with widespread metastases at diagnosis."
    ),
    "Large Cell": (
        "Large cell carcinoma is an undifferentiated NSCLC subtype diagnosed by exclusion. "
        "It tends to grow rapidly and may respond to immunotherapy in PD-L1 high cases."
    ),
    "No Cancer": (
        "No malignant subtype was detected based on the provided clinical features. "
        "Continued monitoring and preventive measures are recommended."
    ),
}


def _build_prompt(
    patient: Dict[str, Any],
    subtype: str,
    confidence: float,
    risk_level: str,
    class_probs: Dict[str, float],
    recommendations: List[str],
) -> str:
    gender_str = (
        "Male" if str(patient.get("patient_gender", "Male")) in ("Male", "M", "1") else "Female"
    )
    age        = patient.get("patient_age", "Unknown")
    smoking    = patient.get("smoking_history", "Unknown")
    fam_hist   = "Yes" if patient.get("family_history", 0) else "No"
    stage      = patient.get("tumor_stage", "Unknown")
    egfr       = "Positive" if patient.get("EGFR_mutation_status", 0) else "Negative"
    kras       = "Positive" if patient.get("KRAS_mutation_status", 0) else "Negative"
    alk        = "Positive" if patient.get("ALK_fusion_status", 0) else "Negative"
    pdl1       = patient.get("PD_L1_expression_level", 0)
    tmb        = patient.get("tumor_mutational_burden", 0)
    nodule     = patient.get("nodule_size_mm", 0)
    location   = patient.get("tumor_location", "Unknown")
    name       = patient.get("patient_name", "the patient")

    desc = SUBTYPE_DESC.get(subtype, "")

    # Top alternative probabilities
    sorted_probs = sorted(class_probs.items(), key=lambda x: x[1], reverse=True)[:3]
    prob_lines   = "\n".join(f"  - {cls}: {p*100:.1f}%" for cls, p in sorted_probs)

    recs_text = "\n".join(f"  {i+1}. {r}" for i, r in enumerate(recommendations[:5]))

    return f"""
You are a compassionate senior clinical AI assistant embedded in PulmoScan AI,
a lung cancer clinical decision support system for trained physicians.

## Patient Summary
Name   : {name}
Age    : {age}
Gender : {gender_str}
Smoking: {smoking} | Family history: {fam_hist}

## Clinical Findings
Nodule size     : {nodule} mm
Tumour location : {location}
Tumour stage    : {stage}
EGFR mutation   : {egfr}
KRAS mutation   : {kras}
ALK fusion      : {alk}
PD-L1 expression: {pdl1:.1f}%
TMB             : {tmb:.1f} mut/Mb

## ML Prediction
Predicted subtype : {subtype}
Confidence score  : {confidence*100:.1f}%
Risk level        : {risk_level}

Top class probabilities:
{prob_lines}

## Subtype Context
{desc}

## Suggested Clinical Actions
{recs_text}

---
Please provide a structured clinical note with the following sections:

1. **Clinical Interpretation** (3–4 sentences, professional tone for a physician)
   – Summarise the prediction, confidence, and most significant biomarker findings.

2. **Patient-Friendly Explanation** (2–3 sentences, plain language)
   – Explain the finding in simple terms the patient can understand.

3. **Key Risk Factors Identified** (bullet list, max 5 items)
   – Highlight the most clinically significant factors present.

4. **Next Steps & Referral Guidance** (2–3 sentences)
   – Based on risk level, state the urgency and type of specialist referral.

5. **Disclaimer** (one line)
   – Remind that this is a decision-support tool, not a definitive diagnosis.

Keep the total response under 400 words. Do NOT exceed the recommended word count.
End with the exact line: "Please consult a qualified oncologist for comprehensive evaluation and treatment planning."
"""


async def get_gemini_explanation(
    patient: Dict[str, Any],
    subtype: str,
    confidence: float,
    risk_level: str,
    class_probs: Dict[str, float],
    recommendations: List[str],
) -> Optional[str]:
    """Call Gemini API and return a structured clinical explanation."""
    api_key = settings.GEMINI_API_KEY
    if not api_key or api_key in ("", "your-gemini-api-key-here"):
        return (
            "Gemini AI explanation unavailable. "
            "Please set GEMINI_API_KEY in your environment file."
        )
    try:
        genai.configure(api_key=api_key)
        model  = genai.GenerativeModel("gemini-2.5-flash")
        prompt = _build_prompt(
            patient, subtype, confidence, risk_level, class_probs, recommendations
        )
        resp = model.generate_content(prompt)
        return resp.text.strip()
    except Exception as exc:
        err = str(exc)
        if "429" in err or "quota" in err.lower():
            return (
                "AI explanation temporarily unavailable — free tier daily quota reached. "
                "It resets at midnight Pacific Time. "
                "The prediction result above is still valid and actionable."
            )
        return f"AI explanation temporarily unavailable: {exc}"
