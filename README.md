# WebWave - Ephemeral Real-time Chat

Welcome to WebWave, a modern chat application designed for temporary, real-time conversations. WebWave allows users to create and join private, expiring chatrooms with ease, offering a seamless experience for both anonymous and authenticated users.

## Features

- **Real-time Communication**: Messages appear instantly without needing to refresh the page, powered by Supabase Realtime.
- **Ephemeral Chatrooms**: All chatrooms automatically expire 2 hours after creation, ensuring conversations are temporary and private.
- **Authenticated & Anonymous Users**: Users can log in to have their chosen username appear with their messages. Alternatively, they can post anonymously without creating an account.
- **Secure & Private Rooms**: Chatrooms are not publicly listed. Access is granted exclusively through a unique 8-digit code.
- **Unique User Avatars**: To make conversations easy to follow, each of the 7 members in a chatroom is assigned a unique color for their avatar. The room's creator is always assigned the color red.
- **Image Sharing**: Users can easily share images by providing a URL.
- **Mobile-First Design**: The application is fully responsive, offering a seamless experience on both desktop and mobile devices.
- **User Authentication**: A simple and secure authentication system allows users to sign up and log in. Logged-in users can see a list of their joined chatrooms.
- **Room Management**: The creator of a chatroom has the ability to delete it.

## How to Use WebWave

### Creating a Chatroom

1.  From the home/login page, click the **"Create New Room"** button.
2.  Enter a name for your chatroom in the dialog that appears.
3.  Click **"Create Room"**. You will be automatically redirected to your new chatroom.

### Joining a Chatroom

1.  Obtain the 8-digit join code from the person who created the room.
2.  From the home/login page, click the **"Join with Code"** button.
3.  Enter the code and click **"Join Room"**.

### Sharing a Chatroom

1.  Once inside a chatroom, click the **"Share"** button located in the header.
2.  A popover will appear with two options:
    -   **Share Link**: Copy the direct URL to the chatroom.
    -   **Room Code**: Copy the 8-digit code for others to join manually.

### Sending Messages

-   Simply type your message in the text area at the bottom of the chat window and press Enter or click the send button.
-   You can also send emojis and share images via URL.

## Tech Stack

- **Framework**: Next.js (App Router)
- **Styling**: Tailwind CSS with shadcn/ui components
- **Database & Realtime**: Supabase
- **Authentication**: Firebase Authentication
- **Deployment**: Firebase App Hosting