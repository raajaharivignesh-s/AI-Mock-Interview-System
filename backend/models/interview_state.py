class InterviewState:
    """
    Central memory object controlling the interview session.
    Tracks progress, scores, and detailed logs.
    """

    def __init__(self):
        # JD + Resume
        self.jd_profile = {}
        self.resume_profile = {}
        self.relevance_score = 0.0

        # Flow Control
        self.total_questions = 0
        self.is_active = True
        self.previous_question = None
        self.previous_answer = None
        self.followup_depth = 0
        self.covered_skills = set()

        # Performance
        self.scores = []

        # Full detailed log
        self.interview_log = []

    # --- Scores ---
    def add_score(self, score: float):
        self.scores.append(score)

    def average_score(self):
        return round(sum(self.scores)/len(self.scores), 2) if self.scores else 0.0

    # --- Question Tracking ---
    def increment_question_count(self):
        self.total_questions += 1

    def end_interview(self):
        self.is_active = False

    # --- Logging ---
    def log_interaction(self, question_number, skill, question, answer, evaluation):
        log_entry = {
            "question_number": question_number,
            "skill": skill,
            "question": question,
            "answer": answer,
            "evaluation": evaluation
        }
        self.interview_log.append(log_entry)