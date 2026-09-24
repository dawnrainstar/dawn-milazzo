#!/usr/bin/env python3
"""
🌿 MS. HEAVY METAL LEAF (2025–2050)
Global Earth Restoration Intelligence & Planetary Nervous System
Author: Rainstar / Planetary Nervous System

Observe. Understand. Restore. Repeat.
Not a corporation. Not a government. A planetary nervous system for regeneration.
"""

import sys
import sqlite3
from datetime import datetime

DB_NAME = "heavy_metal_leaf.db"

CONTAMINATION_HOTSPOTS = [
    (
        "Norilsk Metallurgical Belt, Siberia",
        69.36,
        88.19,
        "Nickel and copper smelting pollution",
        "CRITICAL",
        99,
        "Active Swarm Deployed",
        "Smelter Complex"
    ),
    (
        "Citarum River Basin, Indonesia",
        -6.91,
        107.61,
        "Industrial wastewater and heavy metals",
        "CRITICAL",
        97,
        "Remediation Planning",
        "River Basin"
    ),
    (
        "Kabwe, Zambia",
        -14.45,
        28.45,
        "Lead contamination",
        "CRITICAL",
        98,
        "Active Swarm Deployed",
        "Smelter Complex"
    ),
    (
        "Agbogbloshie, Ghana",
        5.55,
        -0.23,
        "Electronic waste pollution",
        "CRITICAL",
        96,
        "Active Swarm Deployed",
        "Wetland"
    ),
    (
        "Lake Karachay, Russia",
        55.69,
        60.80,
        "Radioactive contamination",
        "CRITICAL",
        100,
        "Active Swarm Deployed",
        "Nuclear Zone"
    ),
    (
        "Rio Doce Disaster Zone, Brazil",
        -19.87,
        -42.85,
        "Mining tailings contamination",
        "CRITICAL",
        88,
        "Remediation Planning",
        "River Basin"
    )
]


def ecosystem_score(forest: int, soil: int, water: int, biodiversity: int) -> int:
    """Calculates overall ecosystem health index from 4 pillars (0-100)."""
    return round((forest + soil + water + biodiversity) / 4)


def toxicity_class(score: int) -> str:
    """
    Classifies ecosystem vitality into 5 standard toxicity / vitality tiers:
    ☣️ EXTREME  = flashing crimson
    🔴 CRITICAL = red
    🟠 HIGH     = orange
    🟡 MODERATE = yellow
    🟢 HEALTHY  = green
    """
    if score < 20:
        return "☣️ EXTREME"
    elif score < 40:
        return "🔴 CRITICAL"
    elif score < 60:
        return "🟠 HIGH"
    elif score < 75:
        return "🟡 MODERATE"
    return "🟢 HEALTHY"


def remediation_matrix(contamination_type: str) -> list:
    """
    Dynamically maps contaminant keywords to autonomous bio-restoration countermeasures.
    """
    actions = []
    text = (contamination_type or "").lower()

    if "lead" in text:
        actions.extend([
            "🌱 Deploy Alyssum hyperaccumulators",
            "🍄 Mycoremediation fungi",
            "⚡ Soil bio-chelation"
        ])

    if "microplastic" in text or "plastic" in text:
        actions.extend([
            "🧹 Mechanical filtration",
            "🦠 Plastic-degrading microbes"
        ])

    if "radioactive" in text or "cesium" in text or "nuclear" in text:
        actions.extend([
            "☢️ Long-term containment",
            "🌲 Phytostabilization buffer zones"
        ])

    if "nickel" in text or "copper" in text or "smelt" in text:
        actions.extend([
            "🌱 Sow heavy metal Brassica bioaccumulators",
            "⚡ Neutralize sulfuric acidity with bio-calcium"
        ])

    if "dye" in text or "chromium" in text or "textile" in text:
        actions.extend([
            "💧 Dispatch River Drone flocculation centrifuges",
            "🦠 Phanerochaete chrysosporium enzymatic dye degradation"
        ])

    if not actions:
        actions.extend([
            "🌱 Native hyperaccumulator seed mix",
            "💧 Riparian wetland bio-swales",
            "🍄 Mycorrhizal biochar capping"
        ])

    return actions


def create_database():
    """Initializes SQLite database with schema and applies user migrations."""
    conn = sqlite3.connect(DB_NAME)
    cur = conn.cursor()

    cur.execute("""
    CREATE TABLE IF NOT EXISTS regions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        forest_health INTEGER,
        soil_health INTEGER,
        water_health INTEGER,
        biodiversity INTEGER,
        ecosystem_score INTEGER,
        contamination_type TEXT,
        source TEXT,
        is_contaminated INTEGER DEFAULT 0,
        threat_level TEXT,
        remediation_status TEXT,
        last_updated TEXT,
        toxicity_index INTEGER,
        region_type TEXT,
        earth_spirit_voice TEXT
    )
    """)
    conn.commit()

    # Safely migrate existing tables if columns are missing
    cur.execute("PRAGMA table_info(regions)")
    cols = [col[1] for col in cur.fetchall()]

    migrations = [
        ("threat_level", "ALTER TABLE regions ADD COLUMN threat_level TEXT;"),
        ("remediation_status", "ALTER TABLE regions ADD COLUMN remediation_status TEXT;"),
        ("last_updated", "ALTER TABLE regions ADD COLUMN last_updated TEXT;"),
        ("toxicity_index", "ALTER TABLE regions ADD COLUMN toxicity_index INTEGER;"),
        ("region_type", "ALTER TABLE regions ADD COLUMN region_type TEXT;"),
        ("is_contaminated", "ALTER TABLE regions ADD COLUMN is_contaminated INTEGER DEFAULT 0;"),
        ("earth_spirit_voice", "ALTER TABLE regions ADD COLUMN earth_spirit_voice TEXT DEFAULT '';")
    ]

    for col_name, stmt in migrations:
        if col_name not in cols:
            cur.execute(stmt)

    conn.commit()
    conn.close()


def seed_planetary_data():
    """Populates database with both contamination hotspots and world bioregions."""
    create_database()
    conn = sqlite3.connect(DB_NAME)
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) FROM regions")
    count = cur.fetchone()[0]

    if count > 0:
        conn.close()
        return

    today = datetime.now().strftime("%Y-%m-%d")

    # Seed Contamination Hotspots
    for item in CONTAMINATION_HOTSPOTS:
        name, lat, lng, contam_desc, threat, tox_idx, status, r_type = item
        # Calculate baseline vitality score based on toxicity index
        base_vit = max(10, 100 - tox_idx)
        score = base_vit
        cur.execute("""
        INSERT INTO regions (
            name, latitude, longitude, forest_health, soil_health,
            water_health, biodiversity, ecosystem_score, contamination_type,
            source, is_contaminated, threat_level, remediation_status,
            last_updated, toxicity_index, region_type, earth_spirit_voice
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            name, lat, lng, base_vit, base_vit - 5, base_vit - 8, base_vit,
            score, contam_desc, "Planetary Network", 1, threat, status,
            today, tox_idx, r_type, f"Memory of {name}: We await restoration."
        ))

    # Whole World Bioregions across continents
    world_regions = [
        # North America
        ("Olympic Rainforest Core, USA", 47.80, -123.60, 88, 79, 92, 84, "Pristine", 0, "LOW", "Restored", "Forest Canopy", 8),
        ("Redwood National Corridor, USA", 41.21, -124.00, 91, 86, 89, 82, "Pristine", 0, "LOW", "Restored", "Forest Canopy", 6),
        ("Everglades Wetland, USA", 25.75, -80.56, 54, 60, 48, 66, "Agricultural Runoff", 0, "MODERATE", "Active Swarm Deployed", "Wetland", 45),
        # South America
        ("Amazon Basin - Tapajós Sector, Brazil", -3.47, -62.22, 64, 58, 69, 78, "Deforestation Pressure", 0, "HIGH", "Active Swarm Deployed", "Forest Canopy", 52),
        ("Cerro de Pasco Mining Core, Peru", -10.68, -76.25, 19, 11, 16, 21, "Open-Pit Lead & Arsenic", 1, "CRITICAL", "Active Swarm Deployed", "Smelter Complex", 97),
        ("Galápagos Marine Sanctuary, Ecuador", -0.95, -90.97, 85, 82, 94, 96, "Marine Upwelling", 0, "LOW", "Restored", "Coral Biome", 10),
        # Europe
        ("Caledonian Forest - Glen Affric, UK", 57.32, -4.42, 52, 44, 81, 59, "Overgrazing & Peat Loss", 0, "MODERATE", "Active Swarm Deployed", "Forest Canopy", 15),
        ("Białowieża Primeval Forest, Poland", 52.70, 23.87, 86, 84, 78, 88, "Old Growth Oak", 0, "LOW", "Restored", "Forest Canopy", 12),
        ("Chernobyl Radioecological Reserve, Ukraine", 51.27, 30.22, 48, 26, 32, 65, "Radioactive Fallout", 1, "HIGH", "Active Swarm Deployed", "Nuclear Zone", 85),
        # Africa
        ("Congo Basin - Salonga Heart, DR Congo", -0.23, 21.76, 82, 85, 76, 89, "Deep Peat Wilderness", 0, "LOW", "Restored", "Forest Canopy", 10),
        ("Serengeti Migration Savanna, Tanzania", -2.33, 34.83, 79, 84, 72, 95, "Great Migration", 0, "LOW", "Restored", "Savanna", 12),
        ("Niger Delta Mangrove Oil Spills, Nigeria", 4.75, 6.83, 26, 16, 14, 22, "Crude Petroleum Spills", 1, "CRITICAL", "Active Swarm Deployed", "Wetland", 95),
        # Asia & Siberia
        ("Aral Sea Toxic Dust Desert, Uzbekistan", 45.00, 59.50, 12, 10, 9, 14, "Pesticide Salt-Storms", 1, "CRITICAL", "Active Swarm Deployed", "Desert/Oasis", 94),
        ("Sundarbans Mangrove Delta, Bangladesh", 21.95, 89.18, 74, 66, 61, 91, "Tidal Mangrove", 0, "MODERATE", "Active Swarm Deployed", "Wetland", 34),
        ("Lake Baikal Ancient Rift, Russia", 53.56, 108.17, 86, 84, 93, 92, "Ancient Freshwater", 0, "LOW", "Restored", "River Basin", 8),
        # Oceania
        ("Great Barrier Reef Northern Sector, Australia", -16.25, 145.80, 70, 74, 62, 89, "Thermal Coral Bleaching", 0, "HIGH", "Active Swarm Deployed", "Coral Biome", 38),
        ("Daintree Wet Tropics, Australia", -16.17, 145.42, 93, 88, 91, 95, "Primitive Rainforest", 0, "LOW", "Restored", "Forest Canopy", 4),
        # Polar & Ocean
        ("Great Pacific Garbage Patch, Pacific Ocean", 35.00, -140.00, 10, 10, 16, 28, "Microplastic Soup", 1, "CRITICAL", "Active Swarm Deployed", "Marine Gyre", 96),
        ("Svalbard Global Seed Vault, Norway", 78.24, 15.49, 30, 72, 90, 65, "Arctic Permafrost", 0, "MODERATE", "Active Swarm Deployed", "Polar Ice", 10)
    ]

    for name, lat, lng, f, s, w, b, contam, is_c, threat, status, r_type, tox_idx in world_regions:
        score = ecosystem_score(f, s, w, b)
        cur.execute("""
        INSERT INTO regions (
            name, latitude, longitude, forest_health, soil_health,
            water_health, biodiversity, ecosystem_score, contamination_type,
            source, is_contaminated, threat_level, remediation_status,
            last_updated, toxicity_index, region_type, earth_spirit_voice
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            name, lat, lng, f, s, w, b, score, contam, "World Satellite Network",
            is_c, threat, status, today, tox_idx, r_type, f"Voice of {name}: Earth breathes."
        ))

    conn.commit()
    conn.close()


def print_cli_banner():
    print("""
========================================================================
   🌿 MS. HEAVY METAL LEAF: GLOBAL PLANETARY NERVOUS SYSTEM (2025–2050)
   Observe. Understand. Restore. Repeat.
   SQLite Database & Restoration Intelligence Engine
========================================================================
    """)


def view_all_regions():
    conn = sqlite3.connect(DB_NAME)
    cur = conn.cursor()
    cur.execute("""
    SELECT id, name, latitude, longitude, ecosystem_score, threat_level, toxicity_index, remediation_status, region_type 
    FROM regions ORDER BY ecosystem_score ASC
    """)
    rows = cur.fetchall()
    conn.close()

    print(f"\n{'ID':<4} {'Vitality':<14} {'Threat':<10} {'Tox':<5} {'Type':<16} {'Region Name':<38} {'Status'}")
    print("-" * 105)
    for r in rows:
        r_id, name, lat, lng, score, threat, tox, status, r_type = r
        t_class = toxicity_class(score)
        threat_str = threat or "LOW"
        tox_str = str(tox or (100 - score))
        type_str = (r_type or "Bioregion")[:15]
        name_str = (name or "")[:36]
        status_str = (status or "Active")[:20]
        print(f"#{r_id:<3} {t_class:<13} {threat_str:<10} {tox_str:<5} {type_str:<16} {name_str:<38} {status_str}")


def view_contaminated_hotspots():
    conn = sqlite3.connect(DB_NAME)
    cur = conn.cursor()
    cur.execute("""
    SELECT id, name, latitude, longitude, ecosystem_score, contamination_type, threat_level, toxicity_index, remediation_status, region_type
    FROM regions WHERE is_contaminated = 1 OR ecosystem_score < 40
    ORDER BY toxicity_index DESC
    """)
    rows = cur.fetchall()
    conn.close()

    print(f"\n☣️ CRITICAL PLANETARY CONTAMINATION HOTSPOTS ({len(rows)} detected):")
    print("=" * 80)
    for r in rows:
        r_id, name, lat, lng, score, contam, threat, tox_idx, status, r_type = r
        t_class = toxicity_class(score)
        print(f"\n[#{r_id}] {name}")
        print(f"   Threat Level:    {threat or 'CRITICAL'}")
        print(f"   Toxicity Index:  {tox_idx or (100 - score)}/100")
        print(f"   Vitality Tier:   {t_class} ({score}%)")
        print(f"   Status:          {status or 'Remediation Planning'}")
        print(f"   Type:            {r_type or 'Industrial Basin'}")
        print(f"   Contaminant:     {contam}")
        print(f"   Coordinates:     {lat:.4f}°, {lng:.4f}°")
        print("   Remediation Matrix Protocols:")
        for action in remediation_matrix(contam):
            print(f"     -> {action}")


def test_remediation_matrix_interactive():
    print("\n🌿 INTERACTIVE REMEDIATION MATRIX ENGINE")
    print("Input a contamination type or toxin (e.g. 'lead', 'microplastic', 'radioactive', 'copper'):")
    user_input = input(">> Toxin or Contaminant: ").strip()
    if not user_input:
        user_input = "lead"
    
    actions = remediation_matrix(user_input)
    print(f"\nGenerated Action Plan for '{user_input}':")
    for act in actions:
        print(f"  {act}")


def main_menu():
    seed_planetary_data()
    print_cli_banner()

    while True:
        print("\n--- PLANETARY INTELLIGENCE MENU ---")
        print("1. View All Regions Across the Whole World")
        print("2. View Critical Contamination Hotspots (Toxicity Index & Matrix)")
        print("3. Test Remediation Matrix for Contaminant")
        print("4. Add New Bioregion Node to Living Database")
        print("5. Export Database as SQL Script")
        print("6. Exit")

        choice = input("\nSelect an option (1-6): ").strip()

        if choice == "1":
            view_all_regions()
        elif choice == "2":
            view_contaminated_hotspots()
        elif choice == "3":
            test_remediation_matrix_interactive()
        elif choice == "4":
            try:
                name = input("Region Name: ").strip()
                lat = float(input("Latitude (-90 to 90): ").strip())
                lng = float(input("Longitude (-180 to 180): ").strip())
                f = int(input("Forest Health (0-100): ").strip())
                s = int(input("Soil Health (0-100): ").strip())
                w = int(input("Water Health (0-100): ").strip())
                b = int(input("Biodiversity (0-100): ").strip())
                contam = input("Contaminant (leave blank if clean): ").strip()
                is_c = 1 if contam else 0
                r_type = input("Region Type (e.g. River Basin, Forest Canopy): ").strip() or "Bioregion"
                
                score = ecosystem_score(f, s, w, b)
                tox_idx = 100 - score if is_c else 10
                threat = "CRITICAL" if score < 40 else "MODERATE" if score < 75 else "LOW"
                status = "Remediation Planning" if is_c else "Active Swarm Deployed"
                today = datetime.now().strftime("%Y-%m-%d")

                conn = sqlite3.connect(DB_NAME)
                cur = conn.cursor()
                cur.execute("""
                INSERT INTO regions (
                    name, latitude, longitude, forest_health, soil_health,
                    water_health, biodiversity, ecosystem_score, contamination_type,
                    source, is_contaminated, threat_level, remediation_status,
                    last_updated, toxicity_index, region_type, earth_spirit_voice
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    name, lat, lng, f, s, w, b, score, contam or "None",
                    "User Input", is_c, threat, status, today, tox_idx, r_type,
                    f"Voice of {name}: Joined planetary network."
                ))
                conn.commit()
                conn.close()
                print(f"✓ Successfully registered '{name}'. Vitality: {score}% ({toxicity_class(score)})")
            except Exception as e:
                print(f"Error adding region: {e}")
        elif choice == "5":
            conn = sqlite3.connect(DB_NAME)
            cur = conn.cursor()
            cur.execute("SELECT * FROM regions")
            rows = cur.fetchall()
            conn.close()
            print(f"-- Dumped {len(rows)} records from {DB_NAME}")
            print("-- Ready for SQLite / PostgreSQL planetary synchronization.")
        elif choice == "6":
            print("\nExiting Ms. Heavy Metal Leaf Planetary Intelligence. May the roots hold.")
            sys.exit(0)
        else:
            print("Invalid option. Please choose 1 through 6.")


if __name__ == "__main__":
    main_menu()
