const FarmingTips = require("../models/FarmingTips")


// CREATE a new tip
exports.createTip = async (req, res) => {
  try {
    const { title, youtubeLink } = req.body;
    const tip = new FarmingTips({ title, youtubeLink });
    await tip.save();
    res.status(201).json({ message: 'Tip added successfully', tip });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET all tips
exports.getTips = async (req, res) => {
  try {
    const tips = await FarmingTips.find().sort({ createdAt: -1 });
    res.json(tips);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// UPDATE a tip
exports.updateTip = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, youtubeLink } = req.body;

    const updatedTip = await FarmingTips.findByIdAndUpdate(
      id,
      { title, youtubeLink },
      { new: true }
    );

    if (!updatedTip) {
      return res.status(404).json({ message: 'Tip not found' });
    }

    res.json({ message: 'Tip updated successfully', tip: updatedTip });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// DELETE a tip
exports.deleteTip = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedTip = await FarmingTips.findByIdAndDelete(id);

    if (!deletedTip) {
      return res.status(404).json({ message: 'Tip not found' });
    }

    res.json({ message: 'Tip deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
