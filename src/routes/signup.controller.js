const Http = require('./http.util');

exports.create = async (req, res) => {
  const { opportunity, slot } = await common(req, res);

  if (!slot) {
    return;
  }

  const i = volunteerIndex(slot, req.user._id);

  if (i === -1) {
    if (slot.volunteers.length < slot.limit) {
      slot.volunteers.push({
        id: req.user._id,
        name: req.user.name
      });
      await global.db.opportunity.update({
        _id: opportunity._id,
        slots: opportunity.slots
      });
    } else {
      res.status(400).send({ error: 'Volunteer limit reached for slot' });
    }
  }

  Http.noContent(req, res);
  return;
};

exports.delete = async (req, res) => {
  const { opportunity, slot } = await common(req, res);

  if (!slot) {
    return ;
  }

  const i = volunteerIndex(slot, req.user._id);

  if (i !== -1) {
    slot.volunteers.splice(i, 1);
    await global.db.opportunity.update({
      _id: opportunity._id,
      slots: opportunity.slots
    });
  }

  Http.noContent(req, res);
  return;
};

const common = async (req, res) => {
  if (!req.user.roles.includes('volunteer')) {
    Http.forbidden(req, res);
    return { undefined, undefined };
  }

  const opportunity = await global.db.opportunity.get(req.params.id);

  if (opportunity === null) {
    Http.notFound(req, res);
    return { undefined, undefined };
  }

  const start = req.body.start || parseInt(req.params.start);
  const slot = findSlot(opportunity, start);

  if (slot === null) {
    res.status(400).send({ error: `No slot at that start time`});
    return { undefined, undefined };
  }

  return { opportunity, slot };
};

// Returns the slot that starts at the given time, or null if not found.
const findSlot = (opportunity, start) => {
  const results = opportunity.slots.filter(slot => slot.start === start);
  return results.length ? results[0] : null;
};

// Returns the index of the volunteer with the given ID in this slot, or
// -1 if the volunteer is not present.
const volunteerIndex = (slot, id) => {
  for (let i = 0; i < slot.volunteers.length; i++) {
    const volunteer = slot.volunteers[i];

    if (volunteer.id === id) {
      return i;
    }
  }

  return -1;
};
