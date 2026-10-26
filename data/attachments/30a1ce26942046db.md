# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - banner [ref=e3]:
      - generic [ref=e4]:
        - link "logo" [ref=e5] [cursor=pointer]:
          - /url: /groups
          - img "logo" [ref=e7]
        - button "AMActiveGroup" [ref=e8] [cursor=pointer]:
          - img [ref=e9]
          - paragraph [ref=e14]: AMActiveGroup
        - generic "Signed in as Auto Member" [ref=e15]:
          - paragraph [ref=e16]: A
    - alert [ref=e19]:
      - img [ref=e20]
      - generic [ref=e22]: We could not finish this step
      - generic [ref=e23]: Payments are not available right now, and you have not been charged. Please try again in a few minutes.
      - button "Try Again" [ref=e24] [cursor=pointer]
  - alert [ref=e25]: Group Subscription | MentalHappy
  - generic:
    - region
    - region
    - region
    - region
    - region
    - region
```