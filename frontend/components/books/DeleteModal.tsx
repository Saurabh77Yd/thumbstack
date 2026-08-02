import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

interface DeleteModalProps {
  isOpen: boolean;
  bookTitle: string;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteModal({ isOpen, bookTitle, isDeleting, onConfirm, onCancel }: DeleteModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} title="Delete book">
      <p className="text-sm text-foreground/60">
        Are you sure you want to delete <strong>{bookTitle}</strong>? This cannot be undone.
      </p>
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm} disabled={isDeleting}>
          {isDeleting ? "Deleting…" : "Delete"}
        </Button>
      </div>
    </Modal>
  );
}
