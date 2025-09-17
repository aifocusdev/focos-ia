import React from 'react';
import { useUIStore } from '../../stores/uiStore';
import { Modal } from './Modal';

export const ModalContainer: React.FC = () => {
  const { modals, closeModal } = useUIStore();

  return (
    <>
      {modals.map((modal) => (
        <Modal
          key={modal.id}
          id={modal.id}
          isOpen={true}
          type={modal.type}
          title={modal.title}
          content={modal.content}
          confirmText={modal.confirmText}
          cancelText={modal.cancelText}
          onConfirm={modal.onConfirm}
          onCancel={modal.onCancel}
          onClose={closeModal}
        />
      ))}
    </>
  );
};