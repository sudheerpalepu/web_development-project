import io
import html
import re
import zipfile


CAREER_PROFILES = [
    {
        "domain": "Software Developer",
        "keywords": [
            "javascript",
            "typescript",
            "react",
            "node",
            "python",
            "java",
            "api",
            "sql",
            "git",
            "html",
            "css",
            "software developer",
            "frontend",
            "backend",
            "full stack",
        ],
        "skills_to_learn": ["System design", "Cloud deployment", "Testing"],
    },
    {
        "domain": "Data Analyst",
        "keywords": [
            "excel",
            "sql",
            "python",
            "tableau",
            "power bi",
            "statistics",
            "analytics",
            "dashboard",
            "reporting",
            "data analysis",
            "data analyst",
            "business intelligence",
        ],
        "skills_to_learn": ["Advanced SQL", "Data storytelling", "A/B testing"],
    },
    {
        "domain": "Data Scientist",
        "keywords": [
            "machine learning",
            "deep learning",
            "python",
            "pandas",
            "numpy",
            "scikit",
            "tensorflow",
            "statistics",
            "model",
            "data science",
            "data scientist",
            "ml",
            "artificial intelligence",
        ],
        "skills_to_learn": ["MLOps", "Feature engineering", "Model evaluation"],
    },
    {
        "domain": "UI UX Designer",
        "keywords": [
            "figma",
            "wireframe",
            "prototype",
            "user research",
            "accessibility",
            "design system",
            "user experience",
            "user interface",
            "ui ux",
            "ui/ux",
        ],
        "skills_to_learn": ["Usability testing", "Design systems", "Interaction design"],
    },
    {
        "domain": "Cloud Engineer",
        "keywords": [
            "aws",
            "azure",
            "gcp",
            "docker",
            "kubernetes",
            "terraform",
            "linux",
            "devops",
            "ci/cd",
            "cloud engineer",
            "cloud computing",
        ],
        "skills_to_learn": ["Infrastructure as code", "Kubernetes", "Cloud security"],
    },
    {
        "domain": "Cybersecurity Analyst",
        "keywords": [
            "security",
            "network",
            "siem",
            "incident",
            "vulnerability",
            "penetration",
            "firewall",
            "risk",
            "cybersecurity",
            "cyber security",
            "soc",
        ],
        "skills_to_learn": ["Threat modeling", "SIEM tools", "Incident response"],
    },
    {
        "domain": "Project Manager",
        "keywords": [
            "agile",
            "scrum",
            "jira",
            "stakeholder",
            "roadmap",
            "planning",
            "delivery",
            "budget",
            "project management",
            "product owner",
        ],
        "skills_to_learn": ["Risk management", "Agile delivery", "Stakeholder communication"],
    },
]

DOMAIN_ALIASES = {
    "Software Developer": ["Software Developer", "Software Development"],
    "Data Analyst": ["Data Analyst", "Data Science", "Business Intelligence"],
    "Data Scientist": ["Data Scientist", "Data Science", "Machine Learning"],
    "UI UX Designer": ["UI UX Designer", "UI/UX Designer", "Product Designer"],
    "Cloud Engineer": ["Cloud Engineer", "Cloud", "DevOps Engineer"],
    "Cybersecurity Analyst": ["Cybersecurity Analyst", "Cyber Security", "Cybersecurity"],
    "Project Manager": ["Project Manager", "Project Management"],
}


def extract_resume_text(filename: str, content: bytes) -> str:
    lower_name = filename.lower()

    if lower_name.endswith(".pdf"):
        text = _extract_pdf_text(content)
    elif lower_name.endswith(".docx"):
        text = _extract_docx_text(content)
    else:
        text = content.decode("utf-8", errors="ignore")

    return clean_text(text)


def clean_text(text: str) -> str:
    return re.sub(r"\s+", " ", html.unescape(text or "")).strip()


def analyze_resume_text(text: str) -> dict:
    normalized = text.lower()
    matched_skills = sorted(
        {
            keyword
            for profile in CAREER_PROFILES
            for keyword in profile["keywords"]
            if _contains_keyword(normalized, keyword)
        }
    )

    recommendations = []

    for profile in CAREER_PROFILES:
        matching_keywords = [
            keyword
            for keyword in profile["keywords"]
            if _contains_keyword(normalized, keyword)
        ]
        score = _calculate_profile_score(normalized, profile, matching_keywords)

        if matching_keywords:
            recommendations.append(
                {
                    "domain": profile["domain"],
                    "match_score": score,
                    "matched_skills": matching_keywords,
                    "skills_to_learn": [
                        skill
                        for skill in profile["skills_to_learn"]
                        if skill.lower() not in normalized
                    ][:3],
                    "reason": (
                        f"Your resume mentions {', '.join(matching_keywords[:4])}, "
                        f"which aligns with {profile['domain']} roles."
                    ),
                }
            )

    recommendations.sort(key=lambda item: item["match_score"], reverse=True)

    if not recommendations:
        recommendations = [
            {
                "domain": "Software Developer",
                "match_score": 35,
                "matched_skills": [],
                "skills_to_learn": ["Python", "SQL", "Git"],
                "reason": "Add more technical skills and project details to improve matching.",
            }
        ]

    return {
        "resume_detected": bool(text),
        "summary": _build_summary(text, matched_skills),
        "matched_skills": matched_skills,
        "recommendations": recommendations[:5],
    }


def aliases_for_domain(domain: str) -> list[str]:
    return DOMAIN_ALIASES.get(domain, [domain])


def _calculate_profile_score(
    normalized_text: str,
    profile: dict,
    matching_keywords: list[str],
) -> int:
    if not matching_keywords:
        return 0

    weighted_matches = sum(_keyword_weight(keyword) for keyword in matching_keywords)
    total_weight = sum(_keyword_weight(keyword) for keyword in profile["keywords"])
    score = round((weighted_matches / total_weight) * 100)

    domain_terms = [profile["domain"], *aliases_for_domain(profile["domain"])]
    if any(_contains_keyword(normalized_text, term.lower()) for term in domain_terms):
        score += 20

    return min(score, 100)


def _keyword_weight(keyword: str) -> int:
    if len(keyword) <= 3:
        return 1

    if " " in keyword or "/" in keyword or "-" in keyword:
        return 3

    return 2


def _contains_keyword(text: str, keyword: str) -> bool:
    if "/" in keyword or "-" in keyword:
        return keyword in text

    return re.search(rf"\b{re.escape(keyword)}\b", text) is not None


def _build_summary(text: str, matched_skills: list[str]) -> str:
    word_count = len(text.split())

    if not text:
        return "No readable text was found in this resume."

    if matched_skills:
        return (
            f"Detected {word_count} words and found {len(matched_skills)} career skills: "
            f"{', '.join(matched_skills[:8])}."
        )

    return f"Detected {word_count} words. Add clearer skills, tools, and project outcomes for better recommendations."


def _extract_pdf_text(content: bytes) -> str:
    try:
        from pypdf import PdfReader

        reader = PdfReader(io.BytesIO(content))
        return "\n".join(page.extract_text() or "" for page in reader.pages)
    except Exception:
        return content.decode("utf-8", errors="ignore")


def _extract_docx_text(content: bytes) -> str:
    try:
        with zipfile.ZipFile(io.BytesIO(content)) as archive:
            document = archive.read("word/document.xml").decode("utf-8", errors="ignore")
    except Exception:
        return content.decode("utf-8", errors="ignore")

    document = re.sub(r"<[^>]+>", " ", document)
    return document
