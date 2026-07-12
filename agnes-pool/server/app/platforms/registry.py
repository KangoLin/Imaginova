from app.platforms.base import BaseEngine


class PlatformRegistry:
    _engines: dict[str, type[BaseEngine]] = {}

    @classmethod
    def register(cls, name: str):
        def wrapper(engine_cls: type[BaseEngine]):
            cls._engines[name] = engine_cls
            return engine_cls
        return wrapper

    @classmethod
    def get(cls, name: str) -> type[BaseEngine]:
        engine = cls._engines.get(name)
        if not engine:
            raise KeyError(f"Platform '{name}' not registered")
        return engine

    @classmethod
    def list_platforms(cls) -> list[str]:
        return list(cls._engines.keys())
