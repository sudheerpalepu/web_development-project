def calculate_prediction(total_jobs, average_salary):
    job_score = min(total_jobs * 2, 40)

    if average_salary >= 100000:
        salary_score = 40
    elif average_salary >= 80000:
        salary_score = 35
    elif average_salary >= 60000:
        salary_score = 30
    elif average_salary >= 40000:
        salary_score = 20
    else:
        salary_score = 10

    demand_score = 20 if total_jobs >= 20 else 10

    career_score = job_score + salary_score + demand_score

    if career_score >= 90:
        future_scope = "Excellent"
    elif career_score >= 75:
        future_scope = "Very High"
    elif career_score >= 60:
        future_scope = "High"
    elif career_score >= 45:
        future_scope = "Moderate"
    else:
        future_scope = "Low"

    return {
        "career_score": career_score,
        "future_scope": future_scope
    }