import pandas as pd
import matplotlib.pyplot as plt

collection = pd.read_csv('data/Artworks.csv', encoding="latin1")
print(collection.shape)
collection = collection.dropna(subset=['ConstituentID'])
print(collection.shape)
collection['ConstituentID'] = collection['ConstituentID'].str.split(',')
collection = collection.explode('ConstituentID')

collection["Medium"] = collection["Medium"].str.strip()

print("@@@@@@@@@@")

exhibitions = pd.read_csv('data/MoMAExhibitions1929to1989.csv', encoding="latin1")
exhibitions = exhibitions.dropna(subset=['ConstituentID'])

collection["DateAcquired"] = pd.to_datetime(collection["DateAcquired"])
# collection["ConstituentID"] = pd.to_numeric(collection["ConstituentID"])

# collection["BeginDate"] = pd.to_datetime(collection["BeginDate"])
# collection["EndDate"] = pd.to_datetime(collection["EndDate"])
# collection["Date"] = pd.to_datetime(collection["Date"])


exhibitions["ExhibitionBeginDate"] = pd.to_datetime(exhibitions["ExhibitionBeginDate"])
exhibitions["ExhibitionEndDate"] = pd.to_datetime(exhibitions["ExhibitionEndDate"])
exhibitions["ConstituentBeginDate"] = pd.to_datetime(exhibitions["ConstituentBeginDate"])
exhibitions["ConstituentEndDate"] = pd.to_datetime(exhibitions["ConstituentEndDate"])

exhibitions["ConstituentID"] = exhibitions["ConstituentID"].astype(int).astype(str)


print(exhibitions.shape)
print(exhibitions.dtypes)
print(collection.shape)
print(collection.dtypes)




print(f"how many objects per medium?{collection['Medium'].value_counts()}")
print(f"how many objects per department? {collection['Department'].value_counts()}")
print(f"how many objects per year? {collection['Date'].value_counts()}")

exhibitions['ExhibitionBeginYear'] = exhibitions['ExhibitionBeginDate'].dt.year
print(exhibitions.groupby("ExhibitionBeginYear").count())

print("----------------")
merged = pd.merge(exhibitions, collection, on="ConstituentID", how="left")
print(merged["ConstituentID"].isna().sum())


print(merged.groupby("Medium")["ExhibitionID"].nunique())



exhibit_counts = merged.groupby("ConstituentID")["ExhibitionID"].nunique().rename("times_exhibited")
collection = collection.merge(exhibit_counts, on="ConstituentID", how="left")
collection["times_exhibited"] = collection["times_exhibited"].fillna(0)

print(collection)

collection["YearAcquired"] = collection["DateAcquired"].dt.year
collection.groupby("YearAcquired")["times_exhibited"].mean().plot()
plt.ylabel("Avg times exhibited")
plt.tight_layout()
plt.show()


current_year = 2026
collection["years_owned"] = current_year - collection["YearAcquired"]
collection["exhibit_rate"] = collection["times_exhibited"] / collection["years_owned"]
collection.groupby("YearAcquired")["exhibit_rate"].mean().plot()
plt.tight_layout()
plt.show()



recent = collection[collection["YearAcquired"] == 2020].sort_values("times_exhibited", ascending=False)
print(recent[["ConstituentID", "times_exhibited"]].head(10))

print("||||||||")
print(collection["ConstituentID"].duplicated().sum())