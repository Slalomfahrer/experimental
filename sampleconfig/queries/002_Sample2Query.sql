SELECT id, a.id 
FROM test a;
/*
---
Critical:
  - id = 1
  - id < 2
  - sometext = 1
Warning:
  - id > 0
---
*/