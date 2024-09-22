import sys
import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.svm import SVC
from sklearn.metrics import accuracy_score
from sklearn.impute import SimpleImputer
import warnings
import json

def read_data_from_sheet(member_code):
    try:
        xls = pd.ExcelFile('Database.xlsx')
        sheet_names = xls.sheet_names
        matching_sheet_name = None
        for sheet_name in sheet_names:
            if member_code in sheet_name:
                matching_sheet_name = sheet_name
                break
        if matching_sheet_name is None:
            raise ValueError("No sheet found matching member_code")
        df = pd.read_excel(xls, sheet_name=matching_sheet_name)
        return df
    except Exception as e:
        print("Error:", e)
        return None

def calculate_average_fat_snf(data):
    try:
        numeric_columns = ['fat', 'snf']  
        data.loc[:, 'Date'] = pd.to_datetime(data['Date'], format='%d/%m/%Y')  # Modified line
        data = data.sort_values(by='Date').reset_index(drop=True)  # Ensure proper sorting and reset index
        df = pd.DataFrame(data)  

        df['Average_fat'] = None
        df['Average_snf'] = None
        df['Fat_deviation'] = None
        df['Snf_deviation'] = None
        df['Health_status'] = None

        length = len(df)
        for i in range(length):
            if i == 0:
                df.loc[0, 'Average_fat'] = df.loc[0, 'fat']
                df.loc[0, 'Average_snf'] = df.loc[0, 'snf']
                df.loc[i, 'Fat_deviation'] = df.loc[i, 'fat'] - df.loc[0, 'fat'].round(1)
                df.loc[i, 'Snf_deviation'] = df.loc[i, 'snf'] - df.loc[0, 'snf'].round(1)
                df.loc[i, 'Health_status'] = 0
            else:
                avg_fat = 0
                avg_snf = 0
                start = i
                j1 = 8
                divide = 0
                times = 7
                count = 0  

                for j in range(1, length, 1):
                    start = start - 1
                    if df.loc[start, 'Health_status'] != 1:
                        avg_fat = df.loc[start, 'fat'] + avg_fat
                        avg_snf = df.loc[start, 'snf'] + avg_snf
                        divide = divide + 1
                        count += 1
                        if start == 0:
                            break
                        if count == times:  
                            break
                    else:
                        j1 = j1 + 1
                        count = 0  

                avg_fat = (avg_fat / divide).round(1)
                avg_snf = (avg_snf / divide).round(1)

                df.loc[i, 'Average_fat'] = avg_fat.round(1)
                df.loc[i, 'Average_snf'] = avg_snf.round(1)
                fat_dev = abs((df.loc[i, 'fat'] - avg_fat).round(1))
                snf_dev = abs((df.loc[i, 'snf'] - avg_snf).round(1))
                df.loc[i, 'Fat_deviation'] = fat_dev
                df.loc[i, 'Snf_deviation'] = snf_dev
                if snf_dev >= 0.6 or fat_dev >= 0.8:
                    df.loc[i, 'Health_status'] = 1
                else:
                    df.loc[i, 'Health_status'] = 0

        return df

    except Exception as e:
        print("Error:", e)
        return None

def predict_health(membercode, fromdate, todate):
    fromdate = int(fromdate)
    todate = int(todate)
    try:
        df = read_data_from_sheet(membercode)

        MorningData = df[df['shift'] == "M"]
        EveningData = df[df['shift'] == "E"]
        
        MorningData = calculate_average_fat_snf(MorningData)  # Process MorningData
        EveningData = calculate_average_fat_snf(EveningData)  # Process EveningData

        df = pd.concat([MorningData, EveningData])
        
        # Convert 'Date' column to datetime format
        df['Date'] = pd.to_datetime(df['Date'])

        
        
        result = []  # Store the results in a list
        # Rest of the code remains the same...
        
        for j in range(fromdate, todate + 1):
            year_data = {}  # Store data for each year

            for k in range(1, 13):  # Loop over months from 1 to 12
                month_mask = df['Date'].dt.month == k
                year_mask = df['Date'].dt.year == j
                filtered_df = df[month_mask & year_mask]
                # print("_________________________________________________")
                # print(filtered_df)
                count = len(filtered_df)
                if count > 0:
                    fatdev = 0
                    snfdev = 0
                    for i in range(count):
                        if filtered_df.iloc[i]['Fat_deviation'] >= 0.8:
                            fatdev += filtered_df.iloc[i]['Fat_deviation']
                            fatdev-=0.7
                        if filtered_df.iloc[i]['Snf_deviation'] >= 0.5:
                            snfdev += filtered_df.iloc[i]['Snf_deviation']
                            snfdev-=0.4
                    
                    # Store month-wise data in a dictionary
                    month_data = {
                        'month': k,
                        'year': j,
                        'fat_avg': round(fatdev, 2),
                        'snf_avg': round(snfdev, 2)
                    }
                    
                    year_data[k] = month_data

            result.append({str(j): year_data})  # Append year data to the result

        # Convert result to JSON
        json_result = json.dumps(result, indent=4)
        print(json_result)
                
    except Exception as e:
        print("Error:", e)



# Read the data from the Node js server
input_data = sys.stdin.readline().strip().split(',')
membercode, fromdate, todate = input_data

predict_health(membercode, fromdate, todate)
