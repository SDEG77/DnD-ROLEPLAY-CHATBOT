const { describe, expect, it } = require('vitest');
const {
  buildInventoryItem,
  mergeInventory,
  syncSetupMemories,
} = require('../../src/utils/campaignState');

function createCampaignFixture() {
  const inventory = [];
  inventory.pull = function pull(id) {
    const index = this.findIndex((item) => String(item._id) === String(id));

    if (index >= 0) {
      this.splice(index, 1);
    }
  };

  return {
    memories: [],
    inventory,
  };
}

describe('campaignState', () => {
  it('syncs the setup memories onto a campaign', () => {
    const campaign = createCampaignFixture();

    syncSetupMemories(campaign, {
      campaignIdea: 'Recover the lost crown',
      characterName: 'Nyra',
      playerName: 'Sigrae',
    });

    expect(campaign.memories).toHaveLength(2);
    expect(campaign.memories[0].content).toContain('Recover the lost crown');
    expect(campaign.memories[1].content).toContain('Nyra is the player character controlled by Sigrae.');
  });

  it('merges inventory updates by name and quantity', () => {
    const campaign = createCampaignFixture();
    campaign.inventory.push({
      _id: 'rope-1',
      name: 'Rope',
      quantity: 1,
      status: 'carried',
      details: '',
    });

    mergeInventory(campaign, [
      { name: 'Rope', action: 'add', quantity: 2, status: 'equipped' },
      { name: 'Torch', action: 'set', quantity: 3, status: 'stored' },
    ]);

    expect(campaign.inventory).toHaveLength(2);
    expect(campaign.inventory[0].quantity).toBe(3);
    expect(campaign.inventory[0].status).toBe('equipped');
    expect(campaign.inventory[1]).toMatchObject({
      name: 'Torch',
      quantity: 3,
      status: 'stored',
    });
  });

  it('builds a normalized inventory item', () => {
    expect(
      buildInventoryItem({
        name: '  Health Potion  ',
        quantity: 2.7,
        status: 'equipped',
        details: '  Restores hit points  ',
      }),
    ).toEqual({
      name: 'Health Potion',
      quantity: 2,
      status: 'equipped',
      details: 'Restores hit points',
    });
  });
});
