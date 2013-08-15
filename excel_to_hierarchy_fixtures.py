# Helper script to convert csv with quiz questions into nice json format for vumi-go js sandbox app to consume
import xlrd
import json
import os
import csv


"""
SAMPLE OUTPUT
    [
        {
            "pk": 1,
            "model": "hierarchy.province",
            "fields": {
                "name": "Northern"
            }
        },
        {
            "pk": 2,
            "model": "hierarchy.province",
            "fields": {
                "name": ""
            }
        },
        {
            "pk": 3,
            "model": "hierarchy.province",
            "fields": {
                "name": "Luapula"
            }
        },
        {
            "pk": 4,
            "model": "hierarchy.province",
            "fields": {
                "name": "MUCHINGA"
            }
        },
        {
            "pk": 5,
            "model": "hierarchy.province",
            "fields": {
                "name": "EASTERN"
            }
        },
        {
            "pk": 6,
            "model": "hierarchy.province",
            "fields": {
                "name": "WESTERN"
            }
        },
        {
            "pk": 7,
            "model": "hierarchy.province",
            "fields": {
                "name": "North Western"
            }
        },
        {
            "pk": 8,
            "model": "hierarchy.province",
            "fields": {
                "name": "Totals"
            }
        }
    ]
"""
PROJECT_ROOT = os.path.abspath(os.path.dirname(__file__))
# The source file for the input can be found in:
# https://docs.google.com/a/westerncapelabs.com/spreadsheet/ccc?key=0AtPQAkHlG50UdGFURjNwNzlhOGFuU3pKY2RTUHBDU0E&usp=drive_web
# and the file should be placed in the project root
input_file = os.path.join(PROJECT_ROOT, "RTS- Final EMIS list.xlsx")
output_file = os.path.join(PROJECT_ROOT, "hierarchy", "fixtures", "hierarchy_upload.json")
output_file_incomplete = os.path.join(PROJECT_ROOT, "hierarchy_incomplete.csv")

output_json = []
output_incomplete_data = []
data_header = ["Province", "District", "Zone", "EMIS", "SCHOOL"]
data_footer = ["", "Totals"]

wb = xlrd.open_workbook(input_file)

worksheets = wb.sheet_names()

province_temp = ["", "Totals"]
district_temp = []
zone_temp = []
school_temp = []
province_pk = 1
district_pk = 1
zone_pk = 1
school_pk = 1

for worksheet_name in worksheets:
    ws = wb.sheet_by_name(worksheet_name)

    if (ws.row_values(0)[0] and ws.row_values(0)[1]) not in data_header:
        continue

    for rownum in range(ws.nrows):
        data = ws.row_values(rownum)
        if (data[0] not in data_header) and (data[0] not in province_temp):
            province_temp_pk = province_pk
            output_json.append({"pk": province_pk, "model": "hierarchy.province", "fields": {"name": data[0]}})
            province_temp.append(data[0])
            province_pk = province_pk + 1

        if (data[1] not in data_header) and (data[1] not in district_temp) and (data[0] not in data_footer):
            # Assumption is that data is sorted into groups
            district_temp_pk = district_pk
            output_json.append({"pk": district_pk, "model": "hierarchy.district", "fields": {"name": data[1], "province": province_temp_pk}})
            district_temp.append(data[1])
            district_pk = district_pk + 1

        if (data[2] not in data_header) and (data[2] not in zone_temp) and (data[0] not in data_footer):
            if data[2] in data_footer or data[3] in data_footer or data[4] in data_footer:
                output_incomplete_data.append(data)
                continue
            else:
                zone_temp_pk = zone_pk
                output_json.append({"pk": zone_pk, "model": "hierarchy.zone", "fields": {"name": data[2], "district": district_temp_pk}})
                zone_temp.append(data[2])
                zone_pk = zone_pk + 1

        if (data[3] not in data_header) and (data[3] not in school_temp) and (data[0] not in data_footer):
            if data[3] in data_footer or data[4] in data_footer or type(data[3]) != float:
                output_incomplete_data.append(data)
                continue
            else:
                output_json.append({"pk": school_pk, "model": "hierarchy.school", "fields": {"emis": int(data[3]), "name": data[4], "zone": zone_temp_pk}})
                school_temp.append(data[3])
                school_pk = school_pk + 1

with open(output_file, 'w') as outfile:
        json.dump(output_json, outfile, indent=4, separators=(',', ': '))

with open(output_file_incomplete, 'wb') as outfile:
        writer = csv.writer(outfile, quoting=csv.QUOTE_ALL)
        output_incomplete_data.insert(0, data_header)
        writer.writerows(output_incomplete_data)
