*** Squerier is ALPHA. It will most probably break something. DO NO USE. ***

*Squerier* allows you to configure queries that are run against a MySQL database. The results of the queries are checked against preconfigured values or rules and then made available to Check_MK (version 1.1.5 or higher required).

# Configuration
Configuration file is `/etc/squerier/squerier.conf`.
Format is YAML.

Example:
`host: localhost
user: slalomfahrer
password: 
port: 3306
database: squerier`

# Queries
Queries are in `/etc/squerier/queries`

Each query requires a separate file. Each file may have a prefix for sorting purposes. The prefix is terminated with "_" (best practice is "001_", "002_", etc.). Each file may have an extension (everything including and after the last ".", best practice is ".sql")
Each file constitutes a separate Check_MK service. The service name is determined by stripping the filename of the prefix and the extension.

Each file has to contain an SQL-Query that is executed against the database and a YAML part that describes the checks that are applied to the resultset. (Best practice is to enclose the YAML part in an SQL comment so that the whole file is a valid SQL statement. This makes copy/pasting the content from/to your favourite SQL tool much easier.)

## The YAML part
The YAML part must consist of two associative arrays, "Critical" and "Warning". Both must contain a list of checks. Each check is a three-part expression separated by spaces. The first part is used as a column identifier that must be present in the resultset of the query. The second part is one of the operators "<, >, =". The third part must be a  numeric value.

### The checks
The resultset must contain exactly one row with an arbitrary number of columns. The column values must all be numeric. 

If the resultset has no rows or more than one row, the check is reported as UNKNOWN.

The checks are tested in the order CRITICAL, then WARNING. The first check to fail determines the end result, except if a later check produces an UNKNOWN result. If more than one check results in UNKNOWN, the last one is actually reported.

TODO: What if column is missing?
TODO: What if stmt has an error?

Example query file:
Filename is `001_SampleQuery.sql`.

`SELECT * 
FROM test;
/*
---
Critical:
  - id = 1
  - id < 2
  - id > 0
  - sometext = 1
  - sometext = bla 
Warning:
  - sometext = blub
---
*/`