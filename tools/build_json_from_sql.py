import os
import pyodbc
import json

# Read connection string from environment variable
CONNECTION_STRING = os.getenv("Server=tcp:employer-search.database.windows.net,1433; Database=employersearch; Uid=Selfaryadmin; Pwd=akdivHYF23#%@; Encrypt=yes; TrustServerCertificate=no; Connection Timeout=30;")

def get_connection():
    conn_str = (
        "Driver={ODBC Driver 18 for SQL Server};"
        f"{CONNECTION_STRING}"
    )
    return pyodbc.connect(conn_str)

def fetch_regions(cursor):
    cursor.execute("""
        SELECT 
            ID,
            State,
            City_Town_Other,
            EmployerLink,
            EmployerName,
            Scale,
            Type,
            Population
        FROM Regions
    """)
    cols = [col[0] for col in cursor.description]
    return [dict(zip(cols, row)) for row in cursor.fetchall()]

def fetch_industries(cursor):
    cursor.execute("""
        SELECT         
            ID,
            Industry,
            Subindustry,
            EmployerLink,
            EmployerName,
            Scale,
            Type
        FROM Industries
    """)
    cols = [col[0] for col in cursor.description]
    return [dict(zip(cols, row)) for row in cursor.fetchall()]

def fetch_dateposted(cursor):
    cursor.execute("""
        SELECT         
            ID,
            DatePosted,
            EmployerLink,
            EmployerName,
            Scale,
            Type
        FROM DatePosted
    """)
    cols = [col[0] for col in cursor.description]
    return [dict(zip(cols, row)) for row in cursor.fetchall()]

def main():
    conn = get_connection()
    cursor = conn.cursor()

    regions = fetch_regions(cursor)
    industries = fetch_industries(cursor)
    dateposted = fetch_dateposted(cursor)

    cursor.close()
    conn.close()

    os.makedirs("public", exist_ok=True)

    with open("public/regionsdata.json", "w", encoding="utf-8") as f:
        json.dump(regions, f, ensure_ascii=False)

    with open("public/industriesdata.json", "w", encoding="utf-8") as f:
        json.dump(industries, f, ensure_ascii=False)

    with open("public/dateposteddata.json", "w", encoding="utf-8") as f:
        json.dump(dateposted, f, ensure_ascii=False)

    print(f"Wrote {len(regions)} regions, {len(industries)} industries, {len(dateposted)} dateposted rows")

if __name__ == "__main__":
    main()
