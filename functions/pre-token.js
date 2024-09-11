const GROUPS_TO_SCOPES = {
  'Admin': ['accessTokenApi/admin'],
  'ReadOnly': ['accessTokenApi/readonly']
}

/**
 * @param {import('aws-lambda').PreTokenGenerationV2TriggerEvent} event 
 * @returns {Promise<import('aws-lambda').PreTokenGenerationV2TriggerEvent}
 */
module.exports.handler = async (event) => {
  const groups = event.request.groupConfiguration.groupsToOverride || [];

  const scopes = groups.map(gr => GROUPS_TO_SCOPES[gr]).flat();

  event.response = {
    claimsAndScopeOverrideDetails: {
      accessTokenGeneration: {
        scopesToAdd: ['openid', 'profile', ...scopes],
      }
    }
  };

  return event;
}