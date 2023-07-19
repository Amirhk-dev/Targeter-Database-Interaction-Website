# Targeter Database Interaction

## Project Explanation

A MySQL-based database is implemented in order to save the information related
to diverse experiments on different microscopes.

The information are grouped into different levels as shown below:
* Subframe
    * Region(s) of Interest
        * Sample
            * Target

There is a possibility to
1. insert (manually or via XML file)
2. edit
3. view
the information on the database.

The project is implemented with Node.js and EJS.

## Notice:
It is not possible to access to the database as the credentials are not provided!
