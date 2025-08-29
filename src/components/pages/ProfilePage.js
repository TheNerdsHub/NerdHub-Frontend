import React from 'react';
import useDocumentTitle from 'hooks/useDocumentTitle';
import { useAuth } from 'contexts/AuthContext';

const Profile = () => {
  useDocumentTitle('Profile');
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Profile</h1>
      <p><strong>Username:</strong> {user?.username || 'N/A'}</p>
      <p><strong>Email:</strong> {user?.email || 'N/A'}</p>
      <p><strong>First Name:</strong> {user?.firstName || 'N/A'}</p>
      <p><strong>Last Name:</strong> {user?.lastName || 'N/A'}</p>
    </div>
  );
};

export default Profile;