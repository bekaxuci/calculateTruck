const getState = ({ getStore, getActions, setStore }) => {
    return {
        store: {
            message: null,
            demo: [
                {
                    title: "FIRST",
                    background: "white",
                    initial: "white"
                },
                {
                    title: "SECOND",
                    background: "white",
                    initial: "white"
                }
            ],
            currentUser: null, // Campo para almacenar el usuario actual
        },
        actions: {
            // Usar getActions para llamar a una función dentro de otra función
            exampleFunction: () => {
                getActions().changeColor(0, "green");
            },

            getMessage: async () => {
                try {
                    // Obtener datos del backend
                    const resp = await fetch(process.env.BACKEND_URL + "/api/hello");
                    const data = await resp.json();
                    setStore({ message: data.message });
                    // No olvides devolver algo, así es como se resuelve el async
                    return data;
                } catch (error) {
                    console.log("Error al cargar el mensaje del backend", error);
                }
            },

            changeColor: (index, color) => {
                // Obtener el store
                const store = getStore();

                // Debemos recorrer todo el array demo para buscar el índice respectivo
                // y cambiar su color
                const demo = store.demo.map((elm, i) => {
                    if (i === index) elm.background = color;
                    return elm;
                });

                // Reiniciar el store global
                setStore({ demo: demo });
            },

            register: async (email, password, firstName, lastName, company) => {
                try {
                    console.log("Datos de registro:", { email, password, firstName, lastName, company });

                    const response = await fetch(`${process.env.BACKEND_URL}/api/register`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            email,
                            password,
                            first_name: firstName,
                            last_name: lastName,
                            company,
                        }),
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.msg || "Error al registrar usuario");
                    }

                    const data = await response.json();
                    console.log("Registro exitoso:", data);
                    return data; // Devuelve el resultado del registro
                } catch (error) {
                    console.error("Error al registrar usuario:", error);
                    throw new Error(error.message);
                }
            }

        }
    };
};

export default getState;
