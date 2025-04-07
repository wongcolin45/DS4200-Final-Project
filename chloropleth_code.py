import pandas as pd
import folium
import requests

df = pd.read_csv("adult_clean.csv")

df["native-country"] = df["native-country"].str.strip()
df["income"] = df["income"].str.strip()

fix_dict = {"United-States": "United States of America"}
df["native-country"] = df["native-country"].replace(fix_dict)

grouped = df.groupby("native-country").agg(
    countTotal=("income", "size"),
    countHigh=("income", lambda x: (x == ">50K").sum())
).reset_index()
grouped["ratio"] = grouped["countHigh"] / grouped["countTotal"]

geojson_url = "https://raw.githubusercontent.com/python-visualization/folium/master/examples/data/world-countries.json"
world_geo = requests.get(geojson_url).json()

for feature in world_geo["features"]:
    country_name = feature["properties"]["name"]
    row = grouped[grouped["native-country"] == country_name]
    if not row.empty:
        feature["properties"]["countTotal"] = int(row["countTotal"].values[0])
        feature["properties"]["countHigh"] = int(row["countHigh"].values[0])
        feature["properties"]["ratio"] = f"{row['ratio'].values[0]*100:.1f}%"
    else:
        feature["properties"]["countTotal"] = 0
        feature["properties"]["countHigh"] = 0
        feature["properties"]["ratio"] = "0.0%"

m = folium.Map(location=[20, 0], zoom_start=2)

choropleth = folium.Choropleth(
    geo_data=world_geo,
    data=grouped,
    columns=["native-country", "ratio"],
    key_on="feature.properties.name",
    fill_color="YlGnBu",
    fill_opacity=0.7,
    line_opacity=0.2,
    legend_name="Proportion of >50K Earners",
    nan_fill_color="lightgrey"
).add_to(m)

folium.GeoJson(
    world_geo,
    style_function=lambda feature: {
        'fillColor': 'transparent',
        'color': 'transparent',
        'weight': 0
    },
    tooltip=folium.GeoJsonTooltip(
        fields=["name", "countTotal", "countHigh", "ratio"],
        aliases=["Country: ", "Total: ", ">50K Count: ", "Ratio: "],
        localize=True,
        sticky=False
    )
).add_to(m)

folium.GeoJson(
    world_geo,
    style_function=lambda feature: {
        'fillColor': 'transparent',
        'color': 'transparent',
        'weight': 0
    },
    popup=folium.GeoJsonPopup(
        fields=["name", "countTotal", "countHigh", "ratio"],
        aliases=["Country: ", "Total: ", ">50K Count: ", "Ratio: "],
        localize=True
    )
).add_to(m)

#m.save("choropleth.html")
