import React from 'react';

function BugReportForm(closeModal) {
    let title = "";
    let description = "";

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Construct the issue data
        const issueData = {
            title,
            body: description,
            labels: ['bug'], // You can customize the labels as needed
        };

        try {
            // Create the GitHub issue using the GitHub API
            const response = await fetch('https://api.github.com/repos/Thorfgin/charactercreator/issues', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + process.env.REACT_APP_GITHUB_TOKEN,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(issueData),
            });

            if (response.status === 201) {
                title = "";
                description = "";
                closeModal();
            } else {
                const responseData = await response.json();
                console.error('Error:', responseData);
                alert('Er ging iets fout bij het verwerken. Probeer het later nog eens.');
                closeModal();
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Er ging iets fout bij het verwerken. Probeer het later nog eens.');
            closeModal();
        }
    };

    return (
        <div className="modal-overlay">
            <div className="bug-modal">
                <h2>Meld een Bug</h2>

                <form onSubmit={handleSubmit}>
                    <div>
                        <label>Titel:</label></div>
                    <div>
                        <input className="bug-input" type="text" onChange={(e) => title = e.target.value} required />
                    </div>
                    <div>
                        <label>Omschrijving:</label>
                    </div>
                    <div>
                        <textarea className="bug-text" onChange={(e) => description = e.target.value} required />
                    </div>
                    <button className="btn-primary" type="submit">Verzend Bug melding</button>
                </form>

            </div>
            <span className="close" onClick={closeModal}>&times;</span>
        </div>

    );
};

export default BugReportForm;
