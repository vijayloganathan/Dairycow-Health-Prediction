import sys
import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.svm import SVC
from sklearn.metrics import accuracy_score
from sklearn.impute import SimpleImputer
import warnings

def read_data_from_sheet(member_code, today_shift):
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
        df = df[df['shift'] == today_shift]
        return df
    except Exception as e:
        print("Error:", e)
        return None
    

def fat_snf_deviation(total_length, df, today_fat, today_snf):
    i = total_length
    avg_fat = 0
    avg_snf = 0
    start = i
    j1 = 8
    divide = 0
    times = 7
    count = 0
    for j in range(1, total_length, 1):
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
    fat_dev = abs((today_fat - avg_fat).round(1))
    snf_dev = abs((today_snf - avg_snf).round(1))
    
    return (fat_dev, snf_dev)

def calculate_average_fat_snf(data):
    try:
        numeric_columns = ['fat', 'snf']  
        data['Date'] = pd.to_datetime(data['Date'], format='%d/%m/%Y')
        data = data.sort_values(by='Date').reset_index()
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

# Function to make predictions
def predict_health(today_fat, today_snf, member_code, specific_date, today_shift):
    try:
        df = read_data_from_sheet(member_code, today_shift)
        
        if df is None:
            return
        df = calculate_average_fat_snf(df)
        df['Health_status'] = df['Health_status'].astype(int)
        X = df[['fat', 'snf', 'Fat_deviation', 'Snf_deviation']].values  # Convert DataFrame to NumPy array
        y = df['Health_status']
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

        imputer = SimpleImputer(strategy='mean')
        X_train_imputed = imputer.fit_transform(X_train)
        X_test_imputed = imputer.transform(X_test)

        # Suppressing the warning
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            svm_model = SVC(kernel='linear')
            svm_model.fit(X_train_imputed, y_train)
        
        y_pred = svm_model.predict(X_test_imputed)
        accuracy = accuracy_score(y_test, y_pred)
        
        print("Model Accuracy:", accuracy)
       
        total_length = len(df)
        result = fat_snf_deviation(total_length, df, today_fat, today_snf)
        

        process_Data = np.array([[today_fat, today_snf, result[0], result[1]]])  
        predicted_health = svm_model.predict(process_Data)
      
        if predicted_health[0] == 1:
           
            print(11)
        else:
            if result[0] >= 0.8 or result[1] >= 0.6:
               
                print(11)
            else:
               
                print(0)
        
       
    except Exception as e:
        print("Error:", e)


# Read the data from the Node js server
input_data = sys.stdin.readline().strip().split(',')
today_fat, today_snf, member_code, specific_date, today_shift = input_data
today_fat = float(today_fat)
today_snf = float(today_snf)

# Convert specific_date from 'YYYY-MM-DD' format to 'DD-MM-YYYY' format
# specific_date_parts = specific_date.split('-')
# specific_date = f"{specific_date_parts[2]}-{specific_date_parts[1]}-{specific_date_parts[0]}"

predict_health(today_fat, today_snf, member_code, specific_date, today_shift)
