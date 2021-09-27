import sys
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor

def getmeanTemp(year,month):
  mon={"jan":1,"feb":2,"march":3,"april":4,"may":5,"june":6,"july":7,"aug":8,"sept":9,"oct":10,"nov":11,"dec":12}
  
  dataset = pd.read_csv('meantemp.csv')
  X = dataset.iloc[:,1].values
  y = dataset.iloc[:,mon[month]+1].values

  X=X.reshape(-1,1)

  
  regressor = RandomForestRegressor(n_estimators = 10, random_state = 0)
  regressor.fit(X, y)

  print(regressor.predict([[year]]))
  sys.stdout.flush()

# year = sys.argv[1]
# month = sys.argv[2]
getmeanTemp(2021,"jan")
