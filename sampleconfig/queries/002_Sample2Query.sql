SELECT a.id, b.id 
FROM test a, test b
LIMIT 1;
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