class CatchAllEmailGenerator:
    def __init__(self, domain: str):
        self.domain = domain
        self._counter = 0

    def generate(self) -> str:
        self._counter += 1
        return f"agnes{self._counter:04d}@{self.domain}"

    def reset(self):
        self._counter = 0
