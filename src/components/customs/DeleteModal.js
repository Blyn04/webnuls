import React from 'react'; 
import { Modal, message } from 'antd';
import { deleteDoc, doc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../backend/firebase/FirebaseConfig';

const DeleteModal = ({ visible, onClose, item, onDeleteSuccess, setDataSource }) => {
  const handleDelete = async () => {
    if (!item) return;

    try {
      // Step 1: Delete from inventory
      const snapshot = await getDocs(collection(db, 'inventory'));

      snapshot.forEach(async (docItem) => {
        const data = docItem.data();
        if (data.itemId === item.itemId) {  // Matching based on itemId or itemName
          await deleteDoc(doc(db, 'inventory', docItem.id));
        }
      });

      // Step 2: Delete matching userRequests
      const usersSnapshot = await getDocs(collection(db, 'accounts'));

      for (const userDoc of usersSnapshot.docs) {
        console.log('Checking user:', userDoc.id); // Debugging line
        const userRequestsRef = collection(db, 'accounts', userDoc.id, 'userRequests');
        const userRequestsSnapshot = await getDocs(userRequestsRef);

        for (const requestDoc of userRequestsSnapshot.docs) {
          const requestData = requestDoc.data();
          const filteredData = requestData?.filteredMergedData;

          if (!Array.isArray(filteredData)) {
            console.log('No filteredMergedData found for request:', requestDoc.id); // Debugging line
            continue;
          }

          // Check if any item in filteredMergedData matches the itemName
          const hasMatchingItem = filteredData.some(entry => {
            console.log('Checking entry.itemName:', entry.itemName); // Debugging line
            return entry.itemName === item.itemName;  // Matching by itemName
          });

          if (hasMatchingItem) {
            console.log('Deleting request:', requestDoc.id); // Debugging line
            await deleteDoc(doc(userRequestsRef, requestDoc.id));
          }

          // Step 3: Query and batch delete matching user requests by userId and timestamp
          const rootQuery = query(
            collection(db, 'userrequests'),
            where('accountId', '==', userDoc.id),  // Assuming userId corresponds to accountId
            where('timestamp', '==', requestData.timestamp)  // Assumes timestamp is unique for each request
          );

          const rootSnap = await getDocs(rootQuery);
          const batchDeletes = [];

          rootSnap.forEach((docSnap) => {
            batchDeletes.push(deleteDoc(doc(db, 'userrequests', docSnap.id)));
          });

          // Execute batch deletion
          for (const deleteRequest of batchDeletes) {
            await deleteRequest;
          }
        }
      }

      // Step 4: Update table state to remove the deleted item from local state
      setDataSource(prevData => {
        return prevData.filter(row => row.itemName !== item.itemName);  // Filter out deleted item
      });

      message.success('Item deleted successfully');
      onDeleteSuccess(item.itemName);  // Callback to update parent state
      onClose();
      
    } catch (error) {
      console.error('Error deleting item:', error);
      message.error('Failed to delete item');
    }
  };

  return (
    <Modal
      title="Confirm Delete"
      visible={visible}
      onOk={handleDelete}
      onCancel={onClose}
      okText="Delete"
      okType="danger"
      cancelText="Cancel"
    >
      <p>Are you sure you want to delete <strong>{item?.name}</strong>?</p>
    </Modal>
  );
};

export default DeleteModal;
