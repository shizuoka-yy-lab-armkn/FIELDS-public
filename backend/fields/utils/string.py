def prepend_slash_if_not_exists(s: str) -> str:
    return s if s.startswith("/") else "/" + s
