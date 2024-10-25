const { readdirSync } = require('fs');

module.exports = (client) => {
  // Function to load all functions from `src/functions`
  const loadFunctions = () => {
    const functionFolders = readdirSync(`././src/functions`);
    for (const folder of functionFolders) {
      const functionFiles = readdirSync(`././src/functions/${folder}`).filter((file) => file.endsWith('.js'));
      for (const file of functionFiles) {
        require(`../../functions/${folder}/${file}`)(client);
      }
    }
  };

  // Function to load all components from `src/components`
  const loadComponents = async () => {
    const componentsFolders = readdirSync(`./src/components`);
    for (const folder of componentsFolders) {
      const componentsFiles = readdirSync(`./src/components/${folder}`).filter((file) => file.endsWith('.js'));

      switch (folder) {
        case 'buttons':
          for (const file of componentsFiles) {
            const button = require(`../components/${folder}/${file}`);
            client.buttons.set(button.data.name, button);
          }
          break;

        case 'interactions':
          for (const file of componentsFiles) {
            const interaction = require(`../components/${folder}/${file}`);
            client.on(interaction.name, interaction.execute.bind(null, client));
          }
          break;

        default:
          break;
      }
    }
  };
  // Load the interactionCreate event
  const interactionCreate = require('../../events/client/interactionCreate');
  client.on(interactionCreate.name, interactionCreate.execute.bind(null, client));
};
