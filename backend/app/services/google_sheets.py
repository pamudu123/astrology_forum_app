from typing import Any

from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build

from app.config import get_settings


class GoogleSheetsClient:
    SCOPES = ["https://www.googleapis.com/auth/spreadsheets"]

    def __init__(self) -> None:
        settings = get_settings()
        credentials = Credentials.from_service_account_file(settings.google_service_account_file, scopes=self.SCOPES)
        self.spreadsheet_id = settings.google_sheets_spreadsheet_id
        self.service = build("sheets", "v4", credentials=credentials)

    def append_row(self, sheet_name: str, values: list[Any]) -> None:
        self.service.spreadsheets().values().append(
            spreadsheetId=self.spreadsheet_id,
            range=f"{sheet_name}!A:Z",
            valueInputOption="USER_ENTERED",
            insertDataOption="INSERT_ROWS",
            body={"values": [values]},
        ).execute()
