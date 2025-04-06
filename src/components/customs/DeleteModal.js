import React from 'react';
import { Modal, message } from 'antd';
import { deleteDoc, doc, collection, getDocs } from 'firebase/firestore';
import { db } from '../../backend/firebase/FirebaseConfig';

const DeleteModal = ({ visible, onClose, item, onDeleteSuccess }) => {
  const handleDelete = async () => {
    if (!item) return;

    try {
      const snapshot = await getDocs(collection(db, 'inventory'));

      snapshot.forEach(async (docItem) => {
        const data = docItem.data();
        if (data.itemId === item.itemId) {
          await deleteDoc(doc(db, 'inventory', docItem.id));
        }
      });

      message.success('Item deleted successfully');
      onDeleteSuccess(item.itemId);
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
