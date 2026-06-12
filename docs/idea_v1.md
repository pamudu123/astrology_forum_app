Need to create a app for fill a form to fill.

There need two roles to the app.

# USER CREATION
Here is the pure logical flow of how user creation and account activation works in the system:

### 1. User Creation (Admin Driven)
The system uses an "invite-only" or "admin-provisioned" model rather than allowing public sign-ups. 

*   **Admin Action:** An existing administrator creates a new profile by providing basic details (such as the person's name, their desired username, and their access role).
*   **Initial State:** The system creates the account but flags it as "Pending." At this stage, the account exists in the database but intentionally does not have a password attached to it yet. 

### 2. Password Creation & Activation (User Driven)
Instead of the admin setting a temporary password or sending an email link, the password creation is handled directly on the login screen the very first time the new user tries to access the app.

*   **Status Check:** When a user enters their username on the login screen, the system looks up the account and checks its status.
*   **Prompt for Password:** If the system sees the account is "Pending" (meaning it's brand new and has no password), it changes the login screen into a setup screen.
*   **User Input:** The new user is prompted to type in a new password and confirm it.
*   **Activation:** Once submitted, the system saves this new password, changes the account status from "Pending" to "Active", and immediately logs the user into the application. 

For all subsequent logins, the system will recognize the account as "Active" and simply ask for the password they just created.

Two Access Roles 
ADMIN - see the filled forms, dashboard of counts, use managemnt and other admin things
USER - can fill the form
----------------

Once user log in there should be options.
For USER :
Mainly tow option fill form for Hadahan
Second Fill form for porondam

Then Info and Settings.
4 tiles.

Example Layout
The Layout Strategy
The Grid Container: It uses a ScrollView with flexDirection: 'row' and flexWrap: 'wrap'. This allows items to sit side-by-side and wrap to the next line when there's no more space.
The Tiles: Each tile is given a width of 48% and an aspectRatio: 1.
The 48% width ensures exactly two tiles fit on each row (taking up 96% of the screen width).
The remaining 4% is automatically used as spacing between the two columns by using justifyContent: 'space-between'.
aspectRatio: 1 guarantees that the tiles will always be perfect squares, regardless of the device size.
Example Code for Your App
Here is how you can implement this exact layout for your forum_app using your 4 requested tiles:

tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
// Assuming you have a hook for auth like in the previous app
// import { useAuth } from '../contexts/AuthContext';
export default function MainMenuScreen() {
    // const { user } = useAuth();
    // const role = user?.role_level || 'USER';
    // A reusable component for your square tiles
    const MenuTile = ({ title, icon, route, color }: any) => (
        <TouchableOpacity
            style={[styles.tile, { backgroundColor: color }]}
            onPress={() => router.push(route)}
        >
            <Ionicons name={icon} size={40} color="white" />
            <Text style={styles.tileText}>{title}</Text>
        </TouchableOpacity>
    );
    return (
        <View style={styles.container}>
            {/* Header Section */}
            <View style={styles.header}>
                <Text style={styles.welcomeText}>Welcome back,</Text>
                <Text style={styles.userName}>John Doe</Text>
            </View>
            {/* Grid Layout for Tiles */}
            <ScrollView contentContainerStyle={styles.grid}>
                
                {/* 1. Fill Form for Hadahan */}
                <MenuTile
                    title="Fill Form (Hadahan)"
                    icon="document-text-outline"
                    route="/forms/hadahan"
                    color="#4CAF50" // Green
                />
                {/* 2. Fill Form for Porondam */}
                <MenuTile
                    title="Fill Form (Porondam)"
                    icon="heart-half-outline"
                    route="/forms/porondam"
                    color="#E91E63" // Pink
                />
                {/* 3. Settings */}
                <MenuTile
                    title="Settings"
                    icon="settings-outline"
                    route="/settings"
                    color="#455A64" // Dark Blue/Grey
                />
                {/* 4. Info */}
                <MenuTile
                    title="App Info"
                    icon="information-circle-outline"
                    route="/info"
                    color="#2196F3" // Light Blue
                />
                {/* Example of Role-Based Rendering for your ADMIN requirement */}
                {/* 
                {role === 'ADMIN' && (
                    <MenuTile
                        title="Admin Dashboard"
                        icon="stats-chart-outline"
                        route="/admin/dashboard"
                        color="#FF9800"
                    />
                )} 
                */}
            </ScrollView>
        </View>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
        padding: 20,
        paddingTop: 60,
    },
    header: {
        marginBottom: 40,
    },
    welcomeText: {
        fontSize: 16,
        color: '#666',
    },
    userName: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingBottom: 30,
    },
    tile: {
        width: '48%', // This ensures 2 columns
        aspectRatio: 1, // This makes them perfect squares
        borderRadius: 20,
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
    },
    tileText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 12,
        textAlign: 'center',
    }
});
Because you also mentioned an ADMIN role in your ideas document, I left a commented-out example at the bottom of the grid showing how you can easily hide or show specific tiles based on the user's role.

---------------
In the admin view there should have mainly two options can navigate thriugh the bottom bar.
In First View it should show all th requests. Second one is the one that has different controls. 
USER app dosent has this two bar in bottom.
In that view user admin has two options Done and Cancel or ON Hold.

In the second page for admins there is another option to see those requests again if needed and also option to filter those.

I am planning to design it as mobile app mainly for user and admin.
And also for guest there is webapplication to fill details.

The filled reports should be saved in DB and also a Excel at Google Drive.

And in Dashbord should show when was form filled.







