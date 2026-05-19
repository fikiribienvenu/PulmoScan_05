"""
PulmoScan AI – Gemini Clinical Explanation Service
Generates patient-friendly clinical explanations via Google Gemini API.

DISCLAIMER: AI-generated explanations are for educational and clinical
decision-support purposes only. They do NOT constitute medical diagnosis.
"""
import google.generativeai as genai
from typing import Optional, Dict, Any
from app.core.config import get_settings

settings = get_settings()

DISCLAIMER = (
    "⚠️ AI-generated explanations are for educational and clinical decision-support "
    "purposes only and do not constitute a medical diagnosis. Always consult a qualified "
    "healthcare professional."
)


def _build_prompt(patient: Dict[str, Any], prediction: str, risk_prob: float,
                  subtype: Optional[str]) -> str:
    symptoms = []
    flag_map = {
        "SMOKING": "Smoking",
        "YELLOW_FINGERS": "Yellow fingers",
        "ANXIETY": "Anxiety",
        "PEER_PRESSURE": "Peer pressure",
        "CHRONIC_DISEASE": "Chronic disease",
        "FATIGUE": "Fatigue",
        "ALLERGY": "Allergy",
        "WHEEZING": "Wheezing",
        "ALCOHOL_CONSUMING": "Alcohol consumption",
        "COUGHING": "Persistent cough",
        "SHORTNESS_OF_BREATH": "Shortness of breath",
        "SWALLOWING_DIFFICULTY": "Swallowing difficulty",
        "CHEST_PAIN": "Chest pain",
    }
    for key, label in flag_map.items():
        if patient.get(key) == 2:
            symptoms.append(label)

    subtype_text = f"Probable subtype (heuristic): {subtype}" if subtype else ""
    return f"""
You are a compassionate clinical AI assistant for a lung cancer risk assessment system.
A patient named {patient.get('patient_name', 'the patient')} (Age: {patient.get('AGE')},
Gender: {'Male' if patient.get('GENDER') == 'M' else 'Female'}) has been assessed.

ML Prediction: {prediction}
Risk Probability: {risk_prob:.1%}
{subtype_text}
Present symptoms/risk factors: {', '.join(symptoms) if symptoms else 'None flagged'}

Please provide:
1. A clinical interpretation (2–3 sentences, professional tone)
2. A patient-friendly explanation (2–3 sentences, simple language)
3. Three specific prevention or lifestyle recommendations
4. Referral suggestions if high risk

Keep the total response under 300 words. Do NOT claim this is a definitive diagnosis.
End with: "Please consult your doctor for a comprehensive evaluation."
"""


async def get_gemini_explanation(
    patient: Dict[str, Any],
    prediction: str,
    risk_prob: float,
    subtype: Optional[str],
) -> Optional[str]:
    """Call Gemini API and return clinical explanation text."""
    api_key = settings.GEMINI_API_KEY
    if not api_key or api_key == "your-gemini-api-key-here":
        return (
            "Gemini AI explanation unavailable. "
            "Please configure GEMINI_API_KEY in your environment. " + DISCLAIMER
        )

    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel("gemini-1.5-flash")
        prompt = _build_prompt(patient, prediction, risk_prob, subtype)
        response = model.generate_content(prompt)
        text = response.text.strip()
        return f"{text}\n\n{DISCLAIMER}"
    except Exception as exc:
        return f"Gemini explanation could not be generated: {exc}\n\n{DISCLAIMER}"
