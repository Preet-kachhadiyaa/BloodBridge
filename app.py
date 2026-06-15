from __future__ import annotations

import hashlib
import html
import math
import re
import unicodedata
from pathlib import Path

import numpy as np
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import streamlit as st
from geopy.distance import geodesic

try:
    from streamlit_geolocation import streamlit_geolocation
except ImportError:
    streamlit_geolocation = None

st.set_page_config("Blood Bridge", "🩸", layout="wide", initial_sidebar_state="expanded")

BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
RARITY = {"A+": 1.0, "A-": 1.2, "B+": 1.0, "B-": 1.25, "AB+": 1.05, "AB-": 1.35, "O+": 0.95, "O-": 1.45}
APP_DIR = Path(__file__).resolve().parent if "__file__" in globals() else Path.cwd()
FILES = {
    "banks": "blood_bank_data.csv",
    "donors": "blood_donation.csv",
    "cities": "india_real_cities.csv",
}
EMPTY_H = ["blood_bank_name", "city_display", "mobile", "estimated_units", "availability", "distance_km", "maps_link"]
EMPTY_D = ["full_name", "blood_group", "city_display", "contact_number", "eligibility_label", "distance_km", "maps_link"]


def css():
    st.markdown(
        """
        <style>
        .stApp{background:
        radial-gradient(circle at top left,rgba(255,82,99,.16),transparent 28%),
        linear-gradient(135deg,#130206,#22040a 45%,#320912 100%);color:#fff7f7}
        [data-testid="stSidebar"]{background:linear-gradient(180deg,rgba(72,6,18,.96),rgba(25,4,7,.98));border-right:1px solid rgba(255,255,255,.08)}
        [data-testid="stSidebar"] .st-emotion-cache-1ibsh2c,[data-testid="stSidebar"] .st-emotion-cache-16txtl3,[data-testid="stSidebar"] .st-emotion-cache-12fmjuu{padding-top:2rem}
        [data-testid="stSidebar"] *{color:#fff4f5!important}.block-container{padding-top:2rem;padding-bottom:2rem}
        .hero,.card,.item{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);backdrop-filter:blur(12px);border-radius:22px;box-shadow:0 16px 40px rgba(0,0,0,.18)}
        .hero{padding:1.4rem 1.5rem;margin-bottom:1rem;background:linear-gradient(135deg,rgba(255,86,110,.22),rgba(115,0,18,.32))}
        .hero h1{margin:0;color:white}.hero p,.muted{color:#f6c8ce;line-height:1.6}
        .card{padding:1rem}.metric{font-size:.86rem;color:#f6c8ce}.value{font-size:1.8rem;font-weight:700;color:white}.sub{font-size:.82rem;color:#ffd7dc}
        .item{padding:1rem;margin:.75rem 0}.title{font-size:1.05rem;font-weight:700;color:white}.meta{font-size:.9rem;color:#ffd9dd;line-height:1.55;margin-top:.35rem}
        .pill{display:inline-block;margin:.5rem .35rem 0 0;padding:.23rem .62rem;border-radius:999px;font-size:.76rem;font-weight:700}
        .ok{background:rgba(89,240,167,.15);color:#aeffd6}.bad{background:rgba(255,123,137,.18);color:#ffd1d7}.warn{background:rgba(255,209,102,.18);color:#ffe6ae}
        a{color:#ffcad0!important}.stTabs [data-baseweb="tab-list"] button{background:rgba(255,255,255,.06);border-radius:12px;margin-right:.4rem}
        .stButton>button{width:100%;border-radius:14px;border:1px solid rgba(255,255,255,.16);background:linear-gradient(135deg,#ff5f79,#c20f36)!important;color:#fff!important;font-weight:700;padding:.7rem 1rem}
        .stButton>button:hover{border-color:rgba(255,255,255,.28);background:linear-gradient(135deg,#ff7187,#d4143e)!important}
        </style>
        """,
        unsafe_allow_html=True,
    )


def norm(x):
    if pd.isna(x):
        return ""
    x = unicodedata.normalize("NFKD", str(x)).encode("ascii", "ignore").decode().lower()
    return re.sub(r"\s+", " ", re.sub(r"[^a-z0-9]+", " ", x)).strip()


def tcase(x):
    x = str(x).strip()
    return x.title() if x else "Unknown"


def stable(seed, mod=100):
    return int(hashlib.md5(seed.encode()).hexdigest()[:8], 16) % mod


def maps(lat, lon):
    return f"https://www.google.com/maps/search/?api=1&query={lat},{lon}"


def haversine(a1, o1, a2, o2):
    r = 6371.0
    p1, p2 = math.radians(a1), math.radians(a2)
    dp, dl = math.radians(a2 - a1), math.radians(o2 - o1)
    x = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return r * 2 * math.atan2(math.sqrt(x), math.sqrt(1 - x))


def dist(origin, target):
    try:
        return haversine(origin[0], origin[1], target[0], target[1])
    except Exception:
        return geodesic(origin, target).km


def dtext(km):
    return f"{km:.1f} km"


def metric(title, value, sub=""):
    st.markdown(
        f"<div class='card'><div class='metric'>{html.escape(title)}</div><div class='value'>{html.escape(str(value))}</div><div class='sub'>{html.escape(str(sub))}</div></div>",
        unsafe_allow_html=True,
    )


def note(title, body):
    st.markdown(
        f"<div class='card'><div class='title'>{html.escape(title)}</div><div class='muted'>{body}</div></div>",
        unsafe_allow_html=True,
    )


def row_card(title, lines, pills, link):
    pill_html = "".join(
        f"<span class='pill {cls}'>{html.escape(str(text))}</span>" for text, cls in pills
    )
    body = "<br>".join(lines)
    st.markdown(
        f"<div class='item'><div class='title'>{html.escape(title)}</div><div class='meta'>{body}</div>{pill_html}<div class='meta' style='margin-top:.7rem'><a href='{link}' target='_blank'>Open in Google Maps</a></div></div>",
        unsafe_allow_html=True,
    )


def find_file(name):
    roots = [APP_DIR, APP_DIR / ".uploads", Path.cwd(), Path.cwd() / ".uploads", Path.home() / ".trae" / "attachments", Path.home() / ".trae" / "work"]
    for root in roots:
        if not root.exists():
            continue
        for pattern in (name, f"*{name}", f"**/*{name}"):
            hit = list(root.glob(pattern))
            if hit:
                return hit[0]
    raise FileNotFoundError(f"Dataset '{name}' was not found. Keep the CSV with `app.py` or upload it again.")


@st.cache_data(show_spinner=False)
def load_data():
    p_b, p_d, p_c = [find_file(FILES[k]) for k in ("banks", "donors", "cities")]
    banks = pd.read_csv(p_b)
    donors = pd.read_csv(p_d)
    cities = pd.read_csv(p_c, usecols=["City", "State", "Latitude", "Longitude"], low_memory=False)

    cities = cities.rename(columns={"City": "city", "State": "state", "Latitude": "latitude", "Longitude": "longitude"})
    cities["city"] = cities["city"].fillna("").astype(str).str.strip()
    cities["latitude"] = pd.to_numeric(cities["latitude"], errors="coerce")
    cities["longitude"] = pd.to_numeric(cities["longitude"], errors="coerce")
    cities = cities.dropna(subset=["city", "latitude", "longitude"])
    cities = cities[cities["latitude"].between(6, 38) & cities["longitude"].between(68, 98)]
    cities["city_norm"] = cities["city"].map(norm)
    city_ref = cities[cities["city_norm"] != ""].groupby("city_norm", as_index=False).agg(
        city=("city", "first"), latitude=("latitude", "median"), longitude=("longitude", "median")
    )
    city_ref["city"] = city_ref["city"].map(tcase)

    donors = donors.copy()
    donors["full_name"] = donors["full_name"].fillna("Anonymous Donor").astype(str).str.strip()
    donors["blood_group"] = donors["blood_group"].fillna("").astype(str).str.upper().str.strip()
    donors["contact_number"] = donors["contact_number"].fillna("Not Available").astype(str).str.strip()
    donors["city"] = donors["city"].fillna("Unknown").astype(str).str.strip()
    donors["age"] = pd.to_numeric(donors["age"], errors="coerce").fillna(pd.to_numeric(donors["age"], errors="coerce").median()).round().astype(int)
    donors["eligible_for_donation"] = donors["eligible_for_donation"].fillna("No").astype(str).str.lower().eq("yes")
    donors["last_donation_date"] = pd.to_datetime(donors["last_donation_date"], errors="coerce", dayfirst=True)
    donors["city_norm"] = donors["city"].map(norm)
    donors = donors.merge(city_ref[["city_norm", "city", "latitude", "longitude"]], on="city_norm", how="left", suffixes=("", "_mapped"))
    donors["city_display"] = donors["city_mapped"].fillna(donors["city"]).map(tcase)
    donors["eligibility_label"] = np.where(donors["eligible_for_donation"], "Eligible", "Needs recovery time")

    banks = banks.copy()
    for col, default in {"blood_bank_name": "Unknown Blood Bank", "city": "Unknown", "address": "Address not available", "mobile": "Not Available", "category": "General"}.items():
        banks[col] = banks[col].fillna(default).astype(str).str.strip()
    banks["latitude"] = pd.to_numeric(banks["latitude"], errors="coerce")
    banks["longitude"] = pd.to_numeric(banks["longitude"], errors="coerce")
    banks["city_norm"] = banks["city"].map(norm)
    banks = banks.merge(city_ref[["city_norm", "city", "latitude", "longitude"]], on="city_norm", how="left", suffixes=("", "_mapped"))
    banks["latitude"] = banks["latitude"].fillna(banks["latitude_mapped"])
    banks["longitude"] = banks["longitude"].fillna(banks["longitude_mapped"])
    banks["city_display"] = banks["city_mapped"].fillna(banks["city"]).map(tcase)
    banks = banks.dropna(subset=["latitude", "longitude"]).reset_index(drop=True)
    banks["bank_id"] = np.arange(1, len(banks) + 1)

    donor_stats = donors.groupby(["city_norm", "blood_group"], dropna=False).agg(
        total_donors=("donor_id", "count"), eligible_donors=("eligible_for_donation", "sum")
    ).reset_index()
    donor_lookup = {(r.city_norm, r.blood_group): (int(r.total_donors), int(r.eligible_donors)) for r in donor_stats.itertuples()}
    bank_count = banks.groupby("city_norm")["bank_id"].count().to_dict()
    inv_rows = []
    bonus = {"Government": 4, "Private": 3, "Charity": 2, "General": 2}
    for b in banks.itertuples():
        for g in BLOOD_GROUPS:
            total, eligible = donor_lookup.get((b.city_norm, g), (0, 0))
            base = bonus.get(str(b.category).title(), 2) + bank_count.get(b.city_norm, 1) * 0.9 + eligible * 1.6 + total * 0.4 + stable(f"{b.blood_bank_name}|{g}", 6) - RARITY[g] * 2.8
            units = int(max(0, min(40, round(base))))
            inv_rows.append({"bank_id": b.bank_id, "blood_group": g, "estimated_units": units, "availability": "Available" if units > 0 else "Unavailable"})
    inventory = pd.DataFrame(inv_rows)

    city_pool = pd.concat(
        [
            donors[["city_norm", "city_display", "latitude", "longitude"]].rename(columns={"city_display": "city"}),
            banks[["city_norm", "city_display", "latitude", "longitude"]].rename(columns={"city_display": "city"}),
            city_ref[["city_norm", "city", "latitude", "longitude"]],
        ],
        ignore_index=True,
    ).dropna(subset=["city_norm", "latitude", "longitude"])
    coverage = pd.concat(
        [donors.groupby("city_norm")["donor_id"].count().rename("donor_count"), banks.groupby("city_norm")["bank_id"].count().rename("bank_count")],
        axis=1,
    ).fillna(0).reset_index()
    coverage["coverage_score"] = coverage["donor_count"] + coverage["bank_count"] * 3
    service_cities = city_pool.groupby("city_norm", as_index=False).agg(city=("city", "first"), latitude=("latitude", "median"), longitude=("longitude", "median")).merge(coverage, on="city_norm", how="left").fillna(0)
    service_cities = service_cities[service_cities["coverage_score"] > 0].sort_values("city").reset_index(drop=True)
    service_cities["city"] = service_cities["city"].map(tcase)

    inv_city = banks[["bank_id", "city_norm"]].merge(inventory, on="bank_id").groupby(["city_norm", "blood_group"])["estimated_units"].sum().to_dict()
    demand_rows = []
    for c in service_cities.itertuples():
        bcount = int(bank_count.get(c.city_norm, 0))
        for g in BLOOD_GROUPS:
            total, eligible = donor_lookup.get((c.city_norm, g), (0, 0))
            available = int(inv_city.get((c.city_norm, g), 0))
            score = 22 + bcount * 2.6 + RARITY[g] * 10 + max(0, 11 - eligible) * 1.8 + max(0, 20 - available) * 0.95 + stable(f"{c.city_norm}|{g}", 5)
            demand_rows.append(
                {
                    "city": c.city,
                    "city_norm": c.city_norm,
                    "blood_group": g,
                    "donor_availability": eligible,
                    "total_donors": total,
                    "blood_banks": bcount,
                    "available_units": available,
                    "demand_score": round(float(score), 2),
                }
            )
    demand = pd.DataFrame(demand_rows)
    return {"banks": banks, "donors": donors, "inventory": inventory, "cities": service_cities, "demand": demand, "paths": {"banks": p_b, "donors": p_d, "cities": p_c}}


def valid_coords(lat, lon):
    return -90 <= lat <= 90 and -180 <= lon <= 180


def query_coords():
    saved = st.session_state.get("gps_coords")
    if isinstance(saved, (tuple, list)) and len(saved) == 2:
        try:
            lat, lon = float(saved[0]), float(saved[1])
            if valid_coords(lat, lon):
                return lat, lon
        except Exception:
            pass
    try:
        lat = st.query_params.get("gps_lat")
        lon = st.query_params.get("gps_lon")
        lat = lat[0] if isinstance(lat, list) else lat
        lon = lon[0] if isinstance(lon, list) else lon
        lat, lon = float(lat), float(lon)
        if valid_coords(lat, lon):
            st.session_state["gps_coords"] = (lat, lon)
            return lat, lon
        return None
    except Exception:
        return None


def geolocate():
    if streamlit_geolocation is None:
        st.warning("Live location needs `streamlit-geolocation`. Run `pip install streamlit-geolocation` and restart the app.")
        return None

    location = streamlit_geolocation()
    if isinstance(location, dict):
        try:
            lat = float(location.get("latitude"))
            lon = float(location.get("longitude"))
        except (TypeError, ValueError):
            return None
        if valid_coords(lat, lon):
            st.session_state["gps_coords"] = (lat, lon)
            return lat, lon
    return None


def set_location_mode(mode):
    st.session_state["location_mode"] = mode


def nearest_city(coords, cities):
    temp = cities.copy()
    temp["distance_km"] = temp.apply(lambda r: dist(coords, (r["latitude"], r["longitude"])), axis=1)
    return temp.nsmallest(1, "distance_km").iloc[0]


def resolve_origin(cities, manual_city, live, live_coords=None):
    coords = live_coords or query_coords()
    if live and coords:
        near = nearest_city(coords, cities)
        return "Live browser location", coords, near["city"]
    row = cities.loc[cities["city"] == manual_city].iloc[0]
    if live:
        return "Waiting for live location", (float(row["latitude"]), float(row["longitude"])), row["city"]
    return "Manual city selection", (float(row["latitude"]), float(row["longitude"])), row["city"]


def nearby_hospitals(banks, inventory, group, origin, radius):
    df = banks.merge(inventory[inventory["blood_group"] == group][["bank_id", "estimated_units", "availability"]], on="bank_id", how="left").copy()
    df["distance_km"] = df.apply(lambda r: dist(origin, (r["latitude"], r["longitude"])), axis=1)
    df["maps_link"] = df.apply(lambda r: maps(r["latitude"], r["longitude"]), axis=1)
    df["availability_sort"] = np.where(df["estimated_units"] > 0, 0, 1)
    return df[df["distance_km"] <= radius].sort_values(["availability_sort", "distance_km", "estimated_units"], ascending=[True, True, False])


def nearby_donors(donors, group, origin, radius, eligible_only=True):
    df = donors[donors["blood_group"] == group].copy()
    if eligible_only:
        df = df[df["eligible_for_donation"]]
    df = df.dropna(subset=["latitude", "longitude"]).copy()
    df["distance_km"] = df.apply(lambda r: dist(origin, (r["latitude"], r["longitude"])), axis=1)
    df["maps_link"] = df.apply(lambda r: maps(r["latitude"], r["longitude"]), axis=1)
    return df[df["distance_km"] <= radius].sort_values(["distance_km", "last_donation_date"]).reset_index(drop=True)


def result_cards(df, kind, limit=10):
    if df.empty:
        st.warning("No matching results found in the selected radius.")
        return
    for r in df.head(limit).itertuples():
        if kind == "hospital":
            row_card(
                f"🏥 {r.blood_bank_name}",
                [
                    f"<strong>Address:</strong> {html.escape(str(r.address))}",
                    f"<strong>City:</strong> {html.escape(str(r.city_display))} | <strong>Category:</strong> {html.escape(str(r.category))}",
                    f"<strong>Contact:</strong> {html.escape(str(r.mobile))} | <strong>Distance:</strong> {dtext(float(r.distance_km))}",
                ],
                [(f"🩸 {r.availability} | {int(r.estimated_units)} units", "ok" if r.estimated_units > 0 else "bad"), (f"📍 {dtext(float(r.distance_km))}", "warn")],
                r.maps_link,
            )
        else:
            last = r.last_donation_date.strftime("%d %b %Y") if pd.notna(r.last_donation_date) else "Unknown"
            row_card(
                f"🧑‍⚕️ {r.full_name}",
                [
                    f"<strong>Blood Group:</strong> {html.escape(str(r.blood_group))} | <strong>City:</strong> {html.escape(str(r.city_display))}",
                    f"<strong>Contact:</strong> {html.escape(str(r.contact_number))} | <strong>Distance:</strong> {dtext(float(r.distance_km))}",
                    f"<strong>Last Donation:</strong> {last}",
                ],
                [(f"❤️ {r.eligibility_label}", "ok" if r.eligible_for_donation else "bad"), (f"📍 {dtext(float(r.distance_km))}", "warn")],
                r.maps_link,
            )


def show_tables(hospitals, donors):
    if not hospitals.empty:
        hv = hospitals[["blood_bank_name", "city_display", "mobile", "estimated_units", "availability", "distance_km", "maps_link"]].rename(
            columns={"blood_bank_name": "Name", "city_display": "City", "mobile": "Contact", "estimated_units": "Blood Units", "availability": "Availability", "distance_km": "Distance (km)", "maps_link": "Google Maps"}
        )
        st.dataframe(hv, use_container_width=True, hide_index=True, column_config={"Google Maps": st.column_config.LinkColumn("Google Maps")})
    if not donors.empty:
        dv = donors[["full_name", "blood_group", "city_display", "contact_number", "eligibility_label", "distance_km", "maps_link"]].rename(
            columns={"full_name": "Name", "blood_group": "Blood Group", "city_display": "City", "contact_number": "Contact", "eligibility_label": "Donation Status", "distance_km": "Distance (km)", "maps_link": "Google Maps"}
        )
        st.dataframe(dv, use_container_width=True, hide_index=True, column_config={"Google Maps": st.column_config.LinkColumn("Google Maps")})


def page_home(origin_label, city, group, hospitals, donors, demand):
    st.markdown(
        """
        <div class='hero'>
            <h1>🩸 Blood Bridge</h1>
            <p>AI-powered blood discovery for hospitals, blood banks, donors, and emergency response. Search by city or live location, check blood availability, find donor backups, and view demand prediction with analytics.</p>
        </div>
        """,
        unsafe_allow_html=True,
    )
    cols = st.columns(4)
    with cols[0]:
        metric("Search origin", city, origin_label)
    with cols[1]:
        metric("Matching hospitals", len(hospitals), f"for {group} nearby")
    with cols[2]:
        metric("Matching donors", len(donors), "eligible and nearby")
    with cols[3]:
        metric("Available blood units", int(hospitals["estimated_units"].sum()) if not hospitals.empty else 0, f"estimated for {group}")

    risk = demand.groupby("city")["demand_score"].mean().sort_values(ascending=False).head(10).reset_index()
    st.plotly_chart(px.bar(risk, x="demand_score", y="city", orientation="h", color="demand_score", color_continuous_scale="Reds", title="Top cities with higher estimated blood demand pressure").update_layout(height=380, margin=dict(l=10, r=10, t=45, b=10)), use_container_width=True)


def page_analytics(banks, donors, inventory, demand):
    st.markdown("## Analytics Dashboard")
    st.caption("Operational analytics for blood availability, donor coverage, and city-level demand pressure.")
    cols = st.columns(4)
    stats = [("Total donors", int(donors["donor_id"].nunique()), "uploaded donor records"), ("Total blood banks", int(banks["bank_id"].nunique()), "across India"), ("Eligible donors", int(donors["eligible_for_donation"].sum()), "ready to donate"), ("Available units", int(inventory["estimated_units"].sum()), "estimated across all groups")]
    for c, args in zip(cols, stats):
        with c:
            metric(*args)

    c1, c2 = st.columns(2)
    with c1:
        g1 = donors.groupby("blood_group")["donor_id"].count().reindex(BLOOD_GROUPS, fill_value=0).reset_index()
        st.plotly_chart(px.bar(g1, x="blood_group", y="donor_id", color="donor_id", color_continuous_scale="Reds", title="Donor distribution by blood group").update_layout(height=360, margin=dict(l=10, r=10, t=45, b=10), xaxis_title="Blood Group", yaxis_title="Donors"), use_container_width=True)
    with c2:
        g2 = banks.groupby("category")["bank_id"].count().reset_index()
        st.plotly_chart(px.pie(g2, names="category", values="bank_id", title="Blood-bank mix by category", color_discrete_sequence=px.colors.sequential.Reds_r).update_layout(height=360, margin=dict(l=10, r=10, t=45, b=10)), use_container_width=True)

    c3, c4 = st.columns(2)
    with c3:
        g3 = pd.concat([donors.groupby("city_display")["donor_id"].count().rename("Donors"), banks.groupby("city_display")["bank_id"].count().rename("Blood Banks")], axis=1).fillna(0).sort_values(["Donors", "Blood Banks"], ascending=False).head(12).reset_index().rename(columns={"city_display": "City"})
        st.plotly_chart(px.bar(g3, x="City", y=["Donors", "Blood Banks"], barmode="group", title="Top service cities by donor and blood-bank activity", color_discrete_sequence=["#ff8a98", "#7f0012"]).update_layout(height=380, margin=dict(l=10, r=10, t=45, b=10)), use_container_width=True)
    with c4:
        heat = demand.pivot_table(index="city", columns="blood_group", values="demand_score", aggfunc="mean").fillna(0)
        heat = heat.loc[heat.mean(axis=1).sort_values(ascending=False).head(12).index]
        fig = go.Figure(data=go.Heatmap(z=heat.values, x=heat.columns.tolist(), y=heat.index.tolist(), colorscale="Reds", colorbar_title="Demand"))
        fig.update_layout(title="AI demand heatmap by city and blood group", height=380, margin=dict(l=10, r=10, t=45, b=10))
        st.plotly_chart(fig, use_container_width=True)


def main():
    css()
    st.sidebar.markdown("## 🩸 Blood Bridge")
    st.sidebar.caption("AI-powered Blood Finder")

    try:
        data = load_data()
    except FileNotFoundError as e:
        st.error(str(e))
        st.stop()
    except Exception as e:
        st.error(f"Unable to load the uploaded datasets: {e}")
        st.stop()

    banks, donors, inventory, cities, demand = data["banks"], data["donors"], data["inventory"], data["cities"], data["demand"]
    pages = ["Home Page", "Nearby Hospitals", "Nearby Donors"]
    page = st.sidebar.radio("Navigation", pages)
    city_list = cities["city"].sort_values().tolist()
    default_city = "Delhi" if "Delhi" in city_list else city_list[0]

    st.sidebar.markdown("### Search controls")
    if "location_mode" not in st.session_state:
        st.session_state["location_mode"] = "manual"

    st.sidebar.radio(
        "Location mode",
        ["Manual city", "Live location"],
        index=0 if st.session_state["location_mode"] == "manual" else 1,
        key="location_mode_radio",
    )
    live = st.session_state["location_mode_radio"] == "Live location"
    st.session_state["location_mode"] = "live" if live else "manual"

    live_coords = None
    if live:
        st.sidebar.info("Click the button below, then allow browser location permission.")
        if st.sidebar.button("Use My Live Location", use_container_width=True):
            st.session_state["show_live_locator"] = True
        with st.sidebar:
            if st.session_state.get("show_live_locator", False):
                live_coords = geolocate()
        city = default_city
    else:
        st.session_state["show_live_locator"] = False
        city = st.sidebar.selectbox("Choose city", city_list, index=city_list.index(default_city))
    group = st.sidebar.selectbox("Select blood group", BLOOD_GROUPS, index=BLOOD_GROUPS.index("O+"))
    radius_h = 120
    radius_d = 150

    origin_label, origin, active_city = resolve_origin(cities, city, live, live_coords)
    if live:
        if query_coords():
            st.sidebar.success(f"Live location: {active_city}")
        else:
            st.sidebar.warning("Live location not detected yet.")
        st.sidebar.caption("Search source: Live browser location")
    else:
        st.sidebar.success(f"Active location: {active_city}")
        st.sidebar.caption(f"Search source: {origin_label}")

    with st.spinner("Finding nearby hospitals, blood banks, and matching donors..."):
        hospitals = nearby_hospitals(banks, inventory, group, origin, radius_h)
        donors_near = nearby_donors(donors, group, origin, radius_d, True)

    if page == "Home Page":
        page_home(origin_label, active_city, group, hospitals, donors_near, demand)
    elif page == "Nearby Hospitals":
        st.markdown("## Nearby Hospitals")
        st.caption("Nearest blood banks and hospitals ranked by distance and blood availability.")
        result_cards(hospitals, "hospital", 20)
        with st.expander("View hospitals in table format"):
            show_tables(hospitals, pd.DataFrame(columns=EMPTY_D))
    elif page == "Nearby Donors":
        st.markdown("## Nearby Donors")
        st.caption("Eligible donor matches for the selected blood group, ranked by nearest distance.")
        result_cards(donors_near, "donor", 20)
        with st.expander("View donors in table format"):
            show_tables(pd.DataFrame(columns=EMPTY_H), donors_near)


if __name__ == "__main__":
    main()
