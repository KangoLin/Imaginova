describe("test infrastructure", () => {
  it("runs a basic test", () => {
    expect(1 + 1).toBe(2);
  });

  it("handles JSX rendering", () => {
    const el = document.createElement("div");
    el.textContent = "hello";
    expect(el.textContent).toBe("hello");
  });
});
