import ApplicationForm from "../components/ApplicationForm";


function AddApplication({
    initialData,
    onSubmit,
    onCancel,
    guest
}) {
    return (
        <ApplicationForm
            initialData={initialData}
            onSubmit={onSubmit}
            onCancel={onCancel}
            guest={guest}
        />
    );
}


export default AddApplication;